'use client'

import { useState } from 'react'

import { IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { BuyerLayout } from '@/components/layout/BuyerLayout'

import { BuyerProfileAvatar } from './_components/BuyerProfileAvatar'
import { BuyerProfileForm } from './_components/BuyerProfileForm'

const MOCK_BUYER_PROFILE = {
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  email: 'somchai.jd@gmail.com',
  phone: '081-234-5678',
  joinedDate: '2026-02-20',
  avatarUrl: null,
}

export default function StoreUserProfilePage() {
  const [profile, setProfile] = useState(MOCK_BUYER_PROFILE)
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [phone, setPhone] = useState(profile.phone)

  return (
    <BuyerLayout>
      <PageTabHeader
        icon={IconUser}
        title="โปรไฟล์ส่วนตัว"
        description="จัดการข้อมูลบัญชีผู้ซื้อ ชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อและรับสิทธิ์สมาชิก"
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BuyerProfileAvatar
          firstName={firstName}
          lastName={lastName}
          email={profile.email}
          className="col-span-1 xl:col-span-4"
        />
        <BuyerProfileForm
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          email={profile.email}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneChange={setPhone}
          className="col-span-1 xl:col-span-8"
        />
      </div>
    </BuyerLayout>
  )
}
