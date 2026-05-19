'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { ProfileAvartar } from './_components/ProfileAvartar'
import { ProfileForm } from './_components/ProfileForm'

export default function MerchantProfilePage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUser}
        title="โปรไฟล์ส่วนตัว"
        description=" จัดการข้อมูลผู้ใช้งานหลักของคุณ"
      />
      <div className="grid gap-5 xl:grid-cols-12">
        <ProfileAvartar
          firstName={'Teeraphat'}
          lastName={'Saengkum'}
          email={'kteeraphatt@gmail.com'}
          joinedDate={new Date()}
          className="col-span-1 xl:col-span-4"
        />
        <ProfileForm className="col-span-1 xl:col-span-8" />
      </div>
    </DashboardSidebar>
  )
}
