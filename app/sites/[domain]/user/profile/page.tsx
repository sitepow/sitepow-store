'use client'

import { BUYER_NAVIGATION } from '@/constants/store/navigation'
import { IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { BuyerProfileAvatar } from './_components/BuyerProfileAvatar'
import { BuyerProfileForm } from './_components/BuyerProfileForm'

export default function StoreUserProfilePage() {
  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconUser}
        title="โปรไฟล์ส่วนตัว"
        description="จัดการข้อมูลบัญชีผู้ซื้อ ชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อและรับสิทธิ์สมาชิก"
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BuyerProfileAvatar className="col-span-1 xl:col-span-4" />
        <BuyerProfileForm className="col-span-1 xl:col-span-8" />
      </div>
    </Sidebar>
  )
}
