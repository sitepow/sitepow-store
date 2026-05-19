'use client'

import { IconSettings } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { BuyerLayout } from '@/components/layout/BuyerLayout'

import { ChangePasswordForm } from './_components/ChangePasswordForm'
import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { PdpaManagementForm } from './_components/PdpaManagementForm'

export default function StoreUserSettingsPage() {
  return (
    <BuyerLayout>
      <PageTabHeader
        icon={IconSettings}
        title="ตั้งค่าบัญชีและความเป็นส่วนตัว"
        description="จัดการความปลอดภัยของรหัสผ่าน การรับข้อมูลแจ้งเตือน และรักษาสิทธิ์ของข้อมูลส่วนบุคคล (PDPA) ของคุณ"
      />
      <ChangePasswordForm />
      <NotificationSettingsForm />
      <PdpaManagementForm />
    </BuyerLayout>
  )
}
