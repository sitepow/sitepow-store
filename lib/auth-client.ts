import { ssoClient } from '@better-auth/sso/client'
import {
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from '@/lib/auth'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,

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
