import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth-server'

import { LoginForm } from './_components/LoginForm'

export default async function LoginPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <LoginForm />
}
