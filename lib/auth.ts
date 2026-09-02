import bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer } from 'better-auth/plugins'

import { prisma } from './prisma'
import { redis } from './redis'

const isProd = process.env.NODE_ENV === 'production'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://accounts.lvh.me:3000',

  plugins: [bearer()],

  trustedCallbacks: async (url: string, request: Request) => {
    try {
      const callbackUrl = new URL(url)
      const hostname = callbackUrl.hostname

      if (
        hostname.includes('sitepow.store') ||
        hostname.includes('lvh.me') ||
        hostname === 'localhost'
      ) {
        return true
      }

      const cacheKey = `domain:slug:${hostname.replace(/^www\./, '')}`
      const storeSlug = await redis.get(cacheKey)

      if (storeSlug) {
        return true
      }

      return true
    } catch (err) {
      return false
    }
  },

  trustedOrigins: async (request) => {
    const baseOrigins = [
      'http://localhost:3000',
      'http://lvh.me:3000',
      'http://*.lvh.me:3000',
      'http://store.lvh.me:3000',
      'http://accounts.lvh.me:3000',
      ...(isProd
        ? [
            'https://sitepow.store',
            'https://*.sitepow.store',
            'https://accounts.sitepow.store',
          ]
        : []),
    ]

    const requestOrigin =
      request?.headers.get('origin') || request?.headers.get('referer')

    if (!requestOrigin) return baseOrigins

    try {
      const originUrl = new URL(requestOrigin)
      const cleanOrigin = originUrl.origin
      return Array.from(new Set([...baseOrigins, cleanOrigin]))
    } catch (error) {
      return baseOrigins
    }
  },

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'line'],
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: isProd,
      httpOnly: true,
      path: '/',
    },
  },

  emailAndPassword: {
    enabled: true,
    password: {
      async verify({ password, hash }) {
        return await bcrypt.compare(password, hash)
      },
      async hash(password) {
        return await bcrypt.hash(password, 10)
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
    line: {
      clientId: process.env.AUTH_LINE_ID!,
      clientSecret: process.env.AUTH_LINE_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'MERCHANT',
      },
    },
  },
})
