import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/auth/RegisterForm'

import { getCurrentUser } from '@/lib/auth/server'

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
    languages: {
      th: `${BASE_URL}/register?lang=th`,
      en: `${BASE_URL}/register?lang=en`,
      'zh-Hans': `${BASE_URL}/register?lang=cn`,
      'x-default': `${BASE_URL}/register`,
    },
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

  return <RegisterForm />
}
