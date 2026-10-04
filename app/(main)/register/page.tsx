import type { Metadata } from 'next'

import { RegisterForm } from '@/components/auth/RegisterForm'

import { getCurrentUser } from '@/lib/auth/server'
import { redirectWithCallback } from '@/lib/utils/redirect'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'สมัครสมาชิกเปิดร้านค้าออนไลน์ฟรี | Sitepow Store',
  description:
    'สมัครสมาชิกเปิดร้านค้าออนไลน์ฟรีกับ Sitepow Store ระบบร้านค้าออนไลน์ จัดการสต็อก POS หลายสาขา ตรวจสลิป AI เริ่มต้นใช้งานได้ทันที',
  alternates: {
    canonical: `${BASE_URL}/register`,
  },
  openGraph: {
    title: 'สมัครสมาชิกเปิดร้านค้าออนไลน์ฟรี | Sitepow Store',
    description:
      'สมัครสมาชิกเปิดร้านค้าออนไลน์ฟรีกับ Sitepow Store ระบบร้านค้าออนไลน์ จัดการสต็อก POS หลายสาขา ตรวจสลิป AI เริ่มต้นใช้งานได้ทันที',
    url: `${BASE_URL}/register`,
    siteName: 'Sitepow Store',
  },
}

interface RegisterPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function TenantRegisterPage({
  searchParams,
}: RegisterPageProps) {
  const userSession = await getCurrentUser()
  const resolvedParams = await searchParams

  if (userSession) {
    redirectWithCallback(resolvedParams?.callbackUrl)
  }

  return <RegisterForm />
}
