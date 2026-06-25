import { useSession as useNextAuthSession } from 'next-auth/react'

export function useSession() {
  const { data: session, status, update } = useNextAuthSession()

  return {
    session,
    user: session?.user ?? null,
    userId: session?.user?.id ?? null,
    userRole: session?.user?.role,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    tokenExpires: session?.expires,
    update,
  }
}
