import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/RegisterForm'

import { getCurrentUser } from '@/lib/auth-server'

export default async function TenantRegisterPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <RegisterForm />
}
