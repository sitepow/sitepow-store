import bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer } from 'better-auth/plugins'

import { prisma } from './prisma'

const isProd = process.env.NODE_ENV === 'production'

export const auth = betterAuth({
  plugins: [bearer()],

  trustedOrigins: async (request) => {
    const requestOrigin =
      request?.headers.get('origin') || request?.headers.get('referer')
    if (!requestOrigin) return []

    try {
      const originUrl = new URL(requestOrigin)
      return [originUrl.origin]
    } catch (error) {
      return []
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
