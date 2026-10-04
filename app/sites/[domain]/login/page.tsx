import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'

import { getCurrentUser } from '@/lib/auth/server'

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function TenantLoginPage({
  searchParams,
}: LoginPageProps) {
  const userSession = await getCurrentUser()
  const resolvedParams = await searchParams

  if (userSession) {
    const callbackUrl = resolvedParams?.callbackUrl
    if (callbackUrl) {
      try {
        if (callbackUrl.startsWith('/')) {
          redirect(callbackUrl)
        }
        const parsed = new URL(callbackUrl)
        const hostname = parsed.hostname
        if (
          hostname.endsWith('sitepow.store') ||
          hostname.endsWith('lvh.me') ||
          hostname === 'localhost'
        ) {
          redirect(callbackUrl)
        }
      } catch {
        // invalid URL fallback to '/'
      }
    }
    redirect('/')
  }

  return <LoginForm />
}
