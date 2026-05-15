import { PropsWithChildren } from 'react'

import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

export async function SessionProviders({ children }: PropsWithChildren) {
  const session = await auth()

  return <SessionProvider session={session}>{children}</SessionProvider>
}
