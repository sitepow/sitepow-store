import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Line from 'next-auth/providers/line'

import { UserRole } from '@/generated/prisma/enums'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain:
          process.env.NODE_ENV === 'production' ? '.sitepow.store' : 'lvh.me',
      },
    },
  },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    Line({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!isMatch) {
          return null
        }

        return user
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: UserRole.MERCHANT,
            isEmailVerified: true,
            emailVerified: new Date(),
          },
        })
      }
    },
  },
  callbacks: {
    async signIn() {
      return true
    },
    async jwt({ token, user, account, trigger }) {
      if (user && account) {
        const isOAuth =
          account.provider === 'google' || account.provider === 'line'

        if (isOAuth) {
          token.role = UserRole.MERCHANT
          token.isEmailVerified = true
        }
      }

      if (user) {
        token.id = user.id as string
        token.role = user.role ?? token.role
        token.isEmailVerified = token.isEmailVerified ?? user.isEmailVerified
      }

      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { isEmailVerified: true, role: true },
        })

        if (dbUser) {
          token.isEmailVerified = dbUser.isEmailVerified
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.isEmailVerified = token.isEmailVerified as boolean | null
        session.user.image = token.picture || ''
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      if (url.includes('callbackUrl=')) {
        const params = new URL(url).searchParams
        return params.get('callbackUrl') || baseUrl
      }

      return url
    },
  },
})
