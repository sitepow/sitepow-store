import type { Metadata } from 'next'

import { LoginForm } from '@/components/auth/LoginForm'

import { getCurrentUser } from '@/lib/auth/server'
import { redirectWithCallback } from '@/lib/utils/redirect'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | Sitepow Store จัดการร้านค้าออนไลน์',
  description:
    'เข้าสู่ระบบ Sitepow Store เพื่อบริหารจัดการร้านค้า สต็อกสินค้า คิดเงินหน้าร้าน POS และรายงานยอดขาย',
  alternates: {
    canonical: `${BASE_URL}/login`,
  },
  openGraph: {
    title: 'เข้าสู่ระบบ | Sitepow Store จัดการร้านค้าออนไลน์',
    description:
      'เข้าสู่ระบบ Sitepow Store เพื่อบริหารจัดการร้านค้า สต็อกสินค้า คิดเงินหน้าร้าน POS และรายงานยอดขาย',
    url: `${BASE_URL}/login`,
    siteName: 'Sitepow Store',
  },
}

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
    redirectWithCallback(resolvedParams?.callbackUrl)
  }

  return <LoginForm />
}
