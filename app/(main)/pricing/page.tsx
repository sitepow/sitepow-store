import { Suspense } from 'react'

import type { Metadata } from 'next'

import { MerchantPricingTabs } from '@/components/MerchantPricingTabs'
import { MainLayout } from '@/components/layout/Layout'
import { PricingSection } from '@/components/section/PricingSection'

import { PricingPackages } from './_components/PricingPackages'
import { PricingTables } from './_components/PricingTables'

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
