import type { Metadata } from 'next'

import { getLandingStores, StoreLandingItem } from '@/actions/store/management/actions'

import { MainLayout } from '@/components/layout/Layout'
import { AiVerificationSection } from '@/components/landing/sections/AiVerificationSection'
import { ChatSection } from '@/components/landing/sections/ChatSection'
import { ComparisonSection } from '@/components/landing/sections/ComparisonSection'
import { CustomerLoyaltySection } from '@/components/landing/sections/CustomerLoyaltySection'
import { ExpenseSection } from '@/components/landing/sections/ExpenseSection'
import { FeatureSection } from '@/components/landing/sections/FeatureSection'
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { InfrastructureSection } from '@/components/landing/sections/InfrastructureSection'
import { InventorySection } from '@/components/landing/sections/InventorySection'
import { LogisticsSection } from '@/components/landing/sections/LogisticsSection'
import { POSSection } from '@/components/landing/sections/POSSection'
import { PaymentSection } from '@/components/landing/sections/PaymentSection'
import { PermissionSection } from '@/components/landing/sections/PermissionSection'
import { PricingPhilosophySection } from '@/components/landing/sections/PricingPhilosophySection'
import { ProductTypeSection } from '@/components/landing/sections/ProductTypeSection'
import { ResellerSection } from '@/components/landing/sections/ResellerSection'
import { SecurityTrustSection } from '@/components/landing/sections/SecurityTrustSection'
import { StoreCustomizationSection } from '@/components/landing/sections/StoreCustomizationSection'
import { StoresSection } from '@/components/landing/sections/StoresSection'
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
