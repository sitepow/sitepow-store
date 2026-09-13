import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/RegisterForm'

import { getCurrentUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'สมัครสมาชิก',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default async function TenantRegisterPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <RegisterForm />
}
