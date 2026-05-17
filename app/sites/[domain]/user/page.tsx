import { BUYER_NAVIGATION } from '@/constants/navigation'

import { SectionContainer } from '@/components/SectionContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { StoreLayout } from '../_components/layout/Layout'
import { AddressesContent } from './_components/AddressesContent'
import { BillingContent } from './_components/BillingContent'
import { DashboardContent } from './_components/DashboardContent'
import { OrdersContent } from './_components/OrdersContent'
import { ProfileContent } from './_components/ProfileContent'
import { RewardsContent } from './_components/RewardsContent'
import { SettingsContent } from './_components/SettingsContent'
import { VouchersContent } from './_components/VouchersContent'
import { WishlistContent } from './_components/WishlistContent'

export default function StoreUserPage() {
  return (
    <StoreLayout>
      <SectionContainer className="text-start">
        <Tabs
          defaultValue="dashboard"
          orientation="vertical"
          className="w-full gap-5"
        >
          <TabsList className="sticky top-36 flex h-auto flex-col justify-start space-y-1">
            {BUYER_NAVIGATION.map((item) => {
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
          <TabsContent value="orders">
            <OrdersContent />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileContent />
          </TabsContent>
          <TabsContent value="addresses">
            <AddressesContent />
          </TabsContent>
          <TabsContent value="billing">
            <BillingContent />
          </TabsContent>
          <TabsContent value="rewards">
            <RewardsContent />
          </TabsContent>
          <TabsContent value="vouchers">
            <VouchersContent />
          </TabsContent>
          <TabsContent value="wishlist">
            <WishlistContent />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsContent />
          </TabsContent>
        </Tabs>
      </SectionContainer>
    </StoreLayout>
  )
}
