import bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import { prisma } from './prisma'

const isProd = process.env.NODE_ENV === 'production'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://accounts.lvh.me:3000',

  trustedOrigins: async (request) => {
    if (!request) {
      return []
    }

    const origin = request.headers.get('origin')

    if (!origin) {
      return []
    }

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

    if (isProd) {
      return [...baseOrigins, origin]
    }

    return baseOrigins
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
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
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
