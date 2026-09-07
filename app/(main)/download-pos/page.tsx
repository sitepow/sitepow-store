import { Suspense } from 'react'

import type { Metadata } from 'next'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { DownloadHeroSection } from './_components/DownloadHeroSection'
import { DownloadPlatformsSection } from './_components/DownloadPlatformsSection'
import { HardwareCompatibilitySection } from './_components/HardwareCompatibilitySection'
import { PosFaqSection } from './_components/PosFaqSection'
import { QuickSetupSection } from './_components/QuickSetupSection'

export const metadata: Metadata = {
  title:
    'ดาวน์โหลดโปรแกรม POS | Sitepow Store: ระบบคิดเงินหน้าร้านสำหรับทุกอุปกรณ์',
  description:
    'ดาวน์โหลดโปรแกรมขายหน้าร้าน Sitepow POS สำหรับ Windows, macOS, Android และ iPadOS รองรับเครื่องพิมพ์ใบเสร็จ สแกนเนอร์ และซิงก์สต็อก Real-time 0% GP',
  alternates: {
    canonical: '/download-pos',
    languages: {
      th: '/download-pos?lang=th',
      en: '/download-pos?lang=en',
    },
  },
}

export default function DownloadPosPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-16 overflow-hidden pt-4 pb-12 md:gap-24">
      <Suspense>
        <DownloadHeroSection />
        <DownloadPlatformsSection />
        <HardwareCompatibilitySection />
        <QuickSetupSection />
        <PosFaqSection />
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
