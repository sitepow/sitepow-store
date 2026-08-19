import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { auth } from './auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
  fetchOptions: {
    credentials: 'include',
  },
})

export const { signIn, signOut, useSession, getSession } = authClient
