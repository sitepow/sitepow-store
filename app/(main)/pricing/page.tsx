import { Suspense } from 'react'

import type { Metadata } from 'next'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { FaqSection } from '@/components/landing-template/FaqSection'
import { MainLayout } from '@/components/layout/Layout'

import { PricingHeroSection } from './_components/PricingHeroSection'
import { PricingPackages } from './_components/PricingPackages'
import { PricingTables } from './_components/PricingTables'
import { ProfitComparisonSection } from './_components/ProfitComparisonSection'

export const metadata: Metadata = {
  title: 'ราคาและแพ็กเกจ | Sitepow Store: เลือกระบบที่เหมาะกับธุรกิจคุณ',
  description:
    'ดูราคาและแพ็กเกจจัดการร้านค้าออนไลน์ Sitepow Store เริ่มต้นฟรี ไม่มีค่าคอมมิชชั่น 0% GP ครบวงจรทั้ง POS สต็อก และจัดการออเดอร์',
  alternates: {
    canonical: '/pricing',
    languages: {
      th: '/pricing?lang=th',
      en: '/pricing?lang=en',
    },
  },
}

export default function PricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-16 overflow-hidden pt-4 pb-12 md:gap-24">
      <Suspense>
        {/* 1. Hero Header & Integrated Billing Period Selector */}
        <PricingHeroSection />

        {/* 2. 4 Modern SaaS Pricing Cards & Common Features Grid */}
        <PricingPackages />

        {/* 3. Profit & ROI Comparison against Marketplaces (0% GP) */}
        <ProfitComparisonSection />

        {/* 4. Deep Feature-by-Feature Comparison Table */}
        <PricingTables />

        {/* 5. Frequently Asked Questions */}
        <FaqSection />

        {/* 6. Closing Call to Action Banner */}
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
