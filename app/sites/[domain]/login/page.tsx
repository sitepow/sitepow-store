import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/LoginForm'

import { getCurrentUser } from '@/lib/auth-server'

export default async function TenantLoginPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <LoginForm />
}
