import bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer } from 'better-auth/plugins'

import { prisma } from './prisma'
import { redis } from './redis'

const isProd = process.env.NODE_ENV === 'production'
const mainDomain =
  process.env.BETTER_AUTH_URL ||
  (isProd ? 'https://sitepow.store' : 'http://localhost:3000')

export const auth = betterAuth({
  baseURL: mainDomain,

  plugins: [bearer()],

  trustedOrigins: async (request) => {
    const baseOrigins = [
      mainDomain,
      'http://localhost:3000',
      'http://lvh.me:3000',
      'http://manage.localhost:3000',
      'http://manage.lvh.me:3000',
      'https://manage.sitepow.store',
      'http://control.localhost:3000',
      'http://control.lvh.me:3000',
      'https://control.sitepow.store',
    ]

    const requestOrigin =
      request?.headers.get('origin') || request?.headers.get('referer')

    if (!requestOrigin) {
      return baseOrigins
    }

    try {
      const originUrl = new URL(requestOrigin)
      const hostname = originUrl.hostname.replace(/^www\./, '')

      if (
        hostname.endsWith('sitepow.store') ||
        hostname.endsWith('lvh.me') ||
        hostname === 'localhost' ||
        hostname.endsWith('localhost')
      ) {
        return Array.from(new Set([...baseOrigins, originUrl.origin]))
      }

      const cacheKey = `domain:slug:${hostname}`
      const storeSlug = await redis.get(cacheKey)

      if (storeSlug) {
        return Array.from(new Set([...baseOrigins, originUrl.origin]))
      }

      return baseOrigins
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
    useSecureCookies: false,
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: isProd,
      httpOnly: true,
      path: '/',
      domain: isProd ? '.sitepow.store' : '.lvh.me',
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
