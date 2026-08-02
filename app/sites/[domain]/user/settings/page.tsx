'use client'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import {
  IconBell,
  IconLock,
  IconSettings,
  IconShieldLock,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ChangePasswordForm } from './_components/ChangePasswordForm'
import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { PdpaManagementForm } from './_components/PdpaManagementForm'

export default function StoreUserSettingsPage() {
  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconSettings}
        title="ตั้งค่าบัญชี"
        description="จัดการความปลอดภัยของรหัสผ่าน การรับข้อมูลแจ้งเตือน และรักษาสิทธิ์ของข้อมูลส่วนบุคคล (PDPA) ของคุณ"
      />

      <Tabs
        defaultValue="password"
        orientation="vertical"
        className="flex flex-col gap-6 xl:flex-row"
      >
        <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col">
          <TabsTrigger value="password">
            <IconLock size={14} /> เปลี่ยนรหัสผ่าน
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <IconBell size={14} /> ตั้งค่าการแจ้งเตือน
          </TabsTrigger>
          <TabsTrigger value="pdpa">
            <IconShieldLock size={14} /> การจัดการข้อมูล (PDPA)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="flex-1">
          <ChangePasswordForm />
        </TabsContent>
        <TabsContent value="notifications" className="flex-1">
          <NotificationSettingsForm />
        </TabsContent>
        <TabsContent value="pdpa" className="flex-1">
          <PdpaManagementForm />
        </TabsContent>
      </Tabs>
    </Sidebar>
  )
}
