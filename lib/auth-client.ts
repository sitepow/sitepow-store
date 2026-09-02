import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { auth } from './auth'

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'https://accounts.sitepow.store',
  plugins: [inferAdditionalFields<typeof auth>()],
  fetchOptions: {
    credentials: 'include',
    onRequest(context) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('bearer_token')
        if (token) {
          context.headers = {
            ...context.headers,
            Authorization: `Bearer ${token}`,
          }
        }
      }
    },
  },
})

export const { signIn, signOut, useSession, getSession } = authClient
