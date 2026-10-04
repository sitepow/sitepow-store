import { UserRole } from '@/generated/prisma/enums'

import { authClient } from '@/lib/auth/client'

export function useSession() {
  const {
    data: sessionData,
    isPending,
    error,
    refetch,
  } = authClient.useSession()

  const user = sessionData?.user ?? null
  const session = sessionData?.session ?? null

  return {
    session,
    user,
    userId: user?.id ?? null,
    userRole: user?.role as UserRole,
    status: isPending ? 'loading' : user ? 'authenticated' : 'unauthenticated',
    isAuthenticated: !!user,
    isLoading: isPending,
    error,
    tokenExpires: session?.expiresAt
      ? new Date(session.expiresAt).toISOString()
      : undefined,
    update: refetch,
  }
}
