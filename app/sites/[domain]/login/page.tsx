import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/LoginForm'

import { getCurrentUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default async function TenantLoginPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <LoginForm />
}
