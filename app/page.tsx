import type { Metadata } from 'next'

import { getLandingStores, StoreLandingItem } from '@/actions/store/management/actions'

import { MainLayout } from '@/components/layout/Layout'
import { AiVerificationSection } from '@/components/section/AiVerificationSection'
import { ChatSection } from '@/components/section/ChatSection'
import { ComparisonSection } from '@/components/section/ComparisonSection'
import { CustomerLoyaltySection } from '@/components/section/CustomerLoyaltySection'
import { ExpenseSection } from '@/components/section/ExpenseSection'
import { FeatureSection } from '@/components/section/FeatureSection'
import { HeroSection } from '@/components/section/HeroSection'
import { InfrastructureSection } from '@/components/section/InfrastructureSection'
import { InventorySection } from '@/components/section/InventorySection'
import { LogisticsSection } from '@/components/section/LogisticsSection'
import { POSSection } from '@/components/section/POSSection'
import { PaymentSection } from '@/components/section/PaymentSection'
import { PermissionSection } from '@/components/section/PermissionSection'
import { PricingPhilosophySection } from '@/components/section/PricingPhilosophySection'
import { ProductTypeSection } from '@/components/section/ProductTypeSection'
import { ResellerSection } from '@/components/section/ResellerSection'
import { SecurityTrustSection } from '@/components/section/SecurityTrustSection'
import { StoreCustomizationSection } from '@/components/section/StoreCustomizationSection'
import { StoresSection } from '@/components/section/StoresSection'
import { JsonLd } from '@/components/seo/JsonLd'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const revalidate = 300

export const metadata: Metadata = {
  title:
    'Sitepow Store | ระบบร้านค้าออนไลน์ ครบวงจร จัดการสต็อก POS และตรวจสลิปอัตโนมัติ',
  description:
    'เปิดร้านค้าออนไลน์สำเร็จรูปกับ Sitepow Store บริหารสต็อกสินค้าหลายสาขา ระบบ POS คิดเงินหน้าร้าน ตรวจเช็คสลิปโอนเงินอัตโนมัติด้วย AI คำนวณค่าส่งอัจฉริยะ 0% ค่าคอมมิชชั่น',
  alternates: {
    canonical: BASE_URL,
    languages: {
      th: `${BASE_URL}?lang=th`,
      en: `${BASE_URL}?lang=en`,
      'zh-Hans': `${BASE_URL}?lang=cn`,
      'x-default': BASE_URL,
    },
  },
  openGraph: {
    title:
      'Sitepow Store | ระบบร้านค้าออนไลน์ ครบวงจร จัดการสต็อก POS และตรวจสลิปอัตโนมัติ',
    description:
      'เปิดร้านค้าออนไลน์สำเร็จรูปกับ Sitepow Store บริหารสต็อกสินค้าหลายสาขา ระบบ POS คิดเงินหน้าร้าน ตรวจเช็คสลิปโอนเงินอัตโนมัติด้วย AI คำนวณค่าส่งอัจฉริยะ 0% ค่าคอมมิชชั่น',
    url: BASE_URL,
    siteName: 'Sitepow Store',
    images: [
      {
        url: '/images/landing/landing-orders-managers.jpeg',
        width: 1200,
        height: 630,
        alt: 'Sitepow Store ระบบร้านค้าออนไลน์',
      },
    ],
  },
}

export default async function HomePage() {
  let initialStores: StoreLandingItem[] = []
  try {
    initialStores = await getLandingStores(11)
  } catch {
    // fallback gracefully
  }

  return (
    <MainLayout className="-mt-12.5" id="main-content">
      <JsonLd />
      <HeroSection />
      <FeatureSection />
      <ProductTypeSection />
      <POSSection />
      <InventorySection />
      <PermissionSection />
      <ExpenseSection />
      <ResellerSection />
      <CustomerLoyaltySection />
      <StoreCustomizationSection />
      <PaymentSection />
      <AiVerificationSection />
      <ChatSection />
      <LogisticsSection />
      <InfrastructureSection />
      <SecurityTrustSection />
      <ComparisonSection />
      <PricingPhilosophySection />
      <StoresSection initialStores={initialStores} />
    </MainLayout>
  )
}
