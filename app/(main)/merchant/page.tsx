'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'

import { LogoBrand } from '@/components/LogoBrand'
import { SectionContainer } from '@/components/SectionContainer'
import { MerchantLayout } from '@/components/layout/MerchantLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AiUsageContent } from './_components/AiUsageContent'
import { AuditLogsContent } from './_components/AuditLogsContent'
import { BillingSubscriptionContent } from './_components/BillingSubscriptionContent'
import { DashboardContent } from './_components/DashboardContent'
import { LoyaltyContent } from './_components/LoyaltyContent'
import { MarketingCouponsContent } from './_components/MarketingCouponsContent'
import { OrganizationBranchesContent } from './_components/OrganizationBranchesContent'
import { ProfileContent } from './_components/ProfileContent'
import { SettingsContent } from './_components/SettingsContent'
import { StoreSettingsContent } from './_components/StoreSettingsContent'

export default function MerchantPage() {
  return (
    <MerchantLayout>
      <SectionContainer className="text-start">
        <Tabs
          defaultValue="dashboard"
          orientation="vertical"
          className="w-full gap-5"
        >
          <TabsList className="sticky top-5 flex h-auto flex-col justify-start space-y-1">
            <LogoBrand className="py-5" />

            {MERCHANT_NAVIGATION.map((item) => {
              const Icon = item.icon

              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="w-full justify-start gap-2"
                >
                  <Icon size={18} stroke={1.5} />
                  <span>{item.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
          <TabsContent value="dashboard">
            <DashboardContent />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileContent />
          </TabsContent>
          <TabsContent value="store-settings">
            <StoreSettingsContent />
          </TabsContent>
          <TabsContent value="billing-subscription">
            <BillingSubscriptionContent />
          </TabsContent>
          <TabsContent value="ai-usage">
            <AiUsageContent />
          </TabsContent>
          <TabsContent value="loyalty">
            <LoyaltyContent />
          </TabsContent>
          <TabsContent value="marketing-coupons">
            <MarketingCouponsContent />
          </TabsContent>
          <TabsContent value="organization-branches">
            <OrganizationBranchesContent />
          </TabsContent>
          <TabsContent value="audit-logs">
            <AuditLogsContent />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsContent />
          </TabsContent>
        </Tabs>
      </SectionContainer>
    </MerchantLayout>
  )
}
