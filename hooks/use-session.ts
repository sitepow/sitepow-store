import { useSession as useNextAuthSession } from 'next-auth/react'

export function useSession() {
  const { data: session, status, update } = useNextAuthSession()

  return {
    session,
    user: session?.user ?? null,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    tokenExpires: session?.expires,
    update,
  }
}
