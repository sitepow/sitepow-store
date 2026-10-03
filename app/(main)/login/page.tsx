import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/LoginForm'

import { getCurrentUser } from '@/lib/auth-server'

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
    languages: {
      th: `${BASE_URL}/login?lang=th`,
      en: `${BASE_URL}/login?lang=en`,
      'zh-Hans': `${BASE_URL}/login?lang=cn`,
      'x-default': `${BASE_URL}/login`,
    },
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

  return <LoginForm />
}
