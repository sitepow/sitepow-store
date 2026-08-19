import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth-server'

import { RegisterForm } from './_components/RegisterForm'

export default async function RegisterPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <RegisterForm />
}
