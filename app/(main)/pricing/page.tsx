import { Suspense } from 'react'

import type { Metadata } from 'next'

import { MerchantPricingTabs } from '@/components/billing/MerchantPricingTabs'
import { MainLayout } from '@/components/layout/Layout'
import { PricingSection } from '@/components/landing/sections/PricingSection'

import { PricingPackages } from './_components/PricingPackages'
import { PricingTables } from './_components/PricingTables'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'ราคาและแพ็กเกจ | Sitepow Store - คุ้มค่า ไม่มีค่าคอมมิชชั่น 0%',
  description:
    'เปรียบเทียบแพ็กเกจราคา Sitepow Store ระบบร้านค้าออนไลน์ ครบทุกฟีเจอร์ POS, จัดการสต็อกสินค้าหลายสาขา, ตรวจสลิป AI เริ่มต้นใช้งานฟรี',
  alternates: {
    canonical: `${BASE_URL}/pricing`,
    languages: {
      th: `${BASE_URL}/pricing?lang=th`,
      en: `${BASE_URL}/pricing?lang=en`,
      'zh-Hans': `${BASE_URL}/pricing?lang=cn`,
      'x-default': `${BASE_URL}/pricing`,
    },
  },
  openGraph: {
    title: 'ราคาและแพ็กเกจ | Sitepow Store - คุ้มค่า ไม่มีค่าคอมมิชชั่น 0%',
    description:
      'เปรียบเทียบแพ็กเกจราคา Sitepow Store ระบบร้านค้าออนไลน์ ครบทุกฟีเจอร์ POS, จัดการสต็อกสินค้าหลายสาขา, ตรวจสลิป AI เริ่มต้นใช้งานฟรี',
    url: `${BASE_URL}/pricing`,
    siteName: 'Sitepow Store',
    images: [
      {
        url: '/images/landing/landing-pricing.jpeg',
        width: 1200,
        height: 630,
        alt: 'ราคาและแพ็กเกจ Sitepow Store',
      },
    ],
  },
}

export default function PricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-5">
      <Suspense>
        <PricingSection />
        <MerchantPricingTabs />
        <PricingPackages />
        <PricingTables />
      </Suspense>
    </MainLayout>
  )
}
