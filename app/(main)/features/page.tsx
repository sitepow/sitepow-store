import { Suspense } from 'react'

import type { Metadata } from 'next'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { FeaturesGridSection } from './_components/FeaturesGridSection'
import { FeaturesHeroSection } from './_components/FeaturesHeroSection'

export const metadata: Metadata = {
  title:
    'ฟีเจอร์และระบบทั้งหมด | Sitepow Store: จัดการร้านค้าออนไลน์ POS สต็อก และ AI',
  description:
    'สำรวจฟีเจอร์ทั้งหมดของ Sitepow Store ทั้งระบบคิดเงินหน้าร้าน POS, ตัดสต็อก Real-time หลายสาขา, AI ช่วยลงสินค้าและตรวจสลิป, ระบบสมาชิก CRM และขายฟรี 0% GP',
  alternates: {
    canonical: '/features',
    languages: {
      th: '/features?lang=th',
      en: '/features?lang=en',
    },
  },
}

export default function FeaturesPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-16 overflow-hidden pt-4 pb-12 md:gap-24">
      <Suspense>
        <FeaturesHeroSection />
        <FeaturesGridSection />
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
