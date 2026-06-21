import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Line from 'next-auth/providers/line'

import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain:
          process.env.NODE_ENV === 'production' ? '.sitepow.store' : undefined,
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
  callbacks: {
    async signIn({ user, account, profile }) {
      return true
    },
    async jwt({ token, user, account, trigger }) {
      if (user && account) {
        const isOAuth =
          account.provider === 'google' || account.provider === 'line'

        if (isOAuth && token.isEmailVerified !== true) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isEmailVerified: true,
                emailVerified: new Date(),
              },
            })

            token.isEmailVerified = true
          } catch (error) {
            console.error(error)
          }
        }
      }

      if (user) {
        token.id = user.id as string
        token.role = user.role
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
