import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/LoginForm'

import { getCurrentUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | Sitepow Store: ระบบจัดการร้านค้าออนไลน์',
  description:
    'เข้าสู่ระบบจัดการร้านค้าหลังบ้าน POS และสินค้าของ Sitepow Store',
  alternates: {
    canonical: '/login',
    languages: {
      th: '/login?lang=th',
      en: '/login?lang=en',
    },
  },
}
export default async function TenantLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  const userSession = await getCurrentUser()
  if (userSession) {
    redirect(params?.callbackUrl || '/')
  }
  return <LoginForm />
}
