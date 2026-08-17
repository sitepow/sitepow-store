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

export default function HomePage() {
  return (
    <MainLayout className="-mt-12.5">
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
      <StoresSection />
    </MainLayout>
  )
}
