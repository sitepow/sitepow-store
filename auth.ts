import NextAuth from 'next-auth'
import Facebook from 'next-auth/providers/facebook'
import Google from 'next-auth/providers/google'
import Line from 'next-auth/providers/line'

import { PrismaAdapter } from '@auth/prisma-adapter'

import { prisma } from './lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, Facebook, Line],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
      }
      return session
    },
  },
})
