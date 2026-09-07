import { Suspense } from 'react'

import type { Metadata } from 'next'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { CompanyInfoSection } from './_components/CompanyInfoSection'
import { ContactChannelsSection } from './_components/ContactChannelsSection'
import { ContactFaqSection } from './_components/ContactFaqSection'
import { ContactFormSection } from './_components/ContactFormSection'
import { ContactHeroSection } from './_components/ContactHeroSection'

export const metadata: Metadata = {
  title:
    'ติดต่อเรา | Sitepow Store: ปรึกษาเปิดร้านค้าออนไลน์และระบบ POS หน้าร้าน',
  description:
    'ติดต่อทีมงาน Sitepow Store เพื่อขอคำปรึกษาการใช้งานระบบจัดการร้านค้าออนไลน์ ระบบ POS หน้าร้าน สอบถามแพ็กเกจ Enterprise หรือแจ้งปัญหาการใช้งาน แอด LINE @830sdfow',
  alternates: {
    canonical: '/contact',
    languages: {
      th: '/contact?lang=th',
      en: '/contact?lang=en',
    },
  },
}

export default function ContactPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-16 overflow-hidden pt-4 pb-12 md:gap-24">
      <Suspense>
        {/* 1. Hero Section */}
        <ContactHeroSection />

        {/* 2. Direct Channels (LINE, Messenger, Live Chat, Email) */}
        <ContactChannelsSection />

        {/* 3. Interactive Contact Form with BorderBeam */}
        <ContactFormSection />

        {/* 4. Enterprise Standards & Security Information */}
        <CompanyInfoSection />

        {/* 5. Frequently Asked Questions */}
        <ContactFaqSection />

        {/* 6. Closing Call to Action Banner */}
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
