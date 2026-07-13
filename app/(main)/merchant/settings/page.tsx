'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import {
  IconBell,
  IconBuildingStore,
  IconCreditCard,
  IconLock,
  IconReceiptTax,
  IconReplace,
  IconSettings,
  IconTruck,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { PaymentSettingsForm } from './_components/PaymentSettingsForm'
import { SecuritySettingsForm } from './_components/SecuritySettingsForm'
import { ShippingSettingsForm } from './_components/ShippingSettingsForm'
import { StoreProfileForm } from './_components/StoreProfileForm'
import { StoreTransferSettingsForm } from './_components/StoreTransferSettingsForm'
import { TaxSettingsForm } from './_components/TaxSettingsForm'

export default function MerchantSettingsPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconSettings}
        title="การตั้งค่าระบบ"
        description="จัดการข้อมูลโครงสร้างร้านค้าหลัก ปรับปรุงระบบความปลอดภัยชั้นสูง และควบคุมตัวเลือกแจ้งเตือนผ่านบัญชี"
      />
      <Tabs
        defaultValue="store-profile"
        orientation="vertical"
        className="flex flex-col gap-6 xl:flex-row"
      >
        <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col">
          <TabsTrigger value="store-profile">
            <IconBuildingStore size={14} /> ตั้งค่าข้อมูลร้านค้า
          </TabsTrigger>
          <TabsTrigger value="security">
            <IconLock size={14} /> ความปลอดภัยบัญชี
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <IconBell size={14} /> ระบบแจ้งเตือนไลน์/อีเมล
          </TabsTrigger>
          <TabsTrigger value="settings-transfer">
            <IconReplace size={14} /> โอนความเป็นเจ้าของร้าน
          </TabsTrigger>
          <TabsTrigger value="settings-tax">
            <IconReceiptTax size={14} /> ภาษีและใบกำกับ
          </TabsTrigger>
          <TabsTrigger value="settings-shipping">
            <IconTruck size={14} /> ระบบขนส่งสินค้า
          </TabsTrigger>
          <TabsTrigger value="settings-payment">
            <IconCreditCard size={14} /> ช่องทางรับชำระเงิน
          </TabsTrigger>
        </TabsList>
        <TabsContent value="store-profile" className="flex-1">
          <StoreProfileForm />
        </TabsContent>
        <TabsContent value="security" className="flex-1">
          <SecuritySettingsForm />
        </TabsContent>
        <TabsContent value="notifications" className="flex-1">
          <NotificationSettingsForm />
        </TabsContent>
        <TabsContent value="settings-transfer" className="flex-1">
          <StoreTransferSettingsForm />
        </TabsContent>
        <TabsContent value="settings-tax" className="flex-1">
          <TaxSettingsForm />
        </TabsContent>
        <TabsContent value="settings-shipping" className="flex-1">
          <ShippingSettingsForm />
        </TabsContent>
        <TabsContent value="settings-payment" className="flex-1">
          <PaymentSettingsForm />
        </TabsContent>
      </Tabs>
    </DashboardSidebar>
  )
}
