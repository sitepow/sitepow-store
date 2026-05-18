'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'
import {
  IconBell,
  IconBuildingStore,
  IconLock,
  IconSettings,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { SecuritySettingsForm } from './_components/SecuritySettingsForm'
import { StoreProfileForm } from './_components/StoreProfileForm'

export default function MerchantSettingsPage() {
  return (
    <MerchantLayout>
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
            <IconBuildingStore size={14} /> <span>ตั้งค่าข้อมูลร้านค้า</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <IconLock size={14} /> <span>ความปลอดภัยบัญชี</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <IconBell size={14} /> <span>ระบบแจ้งเตือนไลน์/อีเมล</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="store-profile">
          <StoreProfileForm />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettingsForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettingsForm />
        </TabsContent>
      </Tabs>
    </MerchantLayout>
  )
}
