import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/RegisterForm'

import { getCurrentUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'สมัครเปิดร้านค้าฟรี | Sitepow Store: เริ่มต้นธุรกิจออนไลน์ 0% GP',
  description:
    'เปิดร้านค้าออนไลน์ฟรีกับ Sitepow Store ครบทุกฟีเจอร์ POS สต็อก และออเดอร์ ไม่มีค่าคอมมิชชั่น 0% GP เริ่มต้นได้ทันที',
  alternates: {
    canonical: '/register',
    languages: {
      th: '/register?lang=th',
      en: '/register?lang=en',
    },
  },
}

export default async function TenantRegisterPage() {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  return <RegisterForm />
}
