import { ssoClient } from '@better-auth/sso/client'
import {
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from '@/lib/auth'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin.includes('lvh.me') ||
        window.location.origin.includes('localhost')
        ? 'http://accounts.lvh.me:3000'
        : 'https://accounts.sitepow.store'
      : process.env.NEXT_PUBLIC_BETTER_URL || 'https://accounts.sitepow.store',

  plugins: [
    organizationClient(),
    ssoClient(),
    inferAdditionalFields<typeof auth>(),
  ],
  fetchOptions: {
    credentials: 'include',
  },
})

export const { signIn, signOut, useSession, getSession } = authClient
