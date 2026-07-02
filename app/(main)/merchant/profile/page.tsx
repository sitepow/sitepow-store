'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { UpdateProfileSchema, updateProfileSchema } from '@/zod/profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { ProfileAvartar } from './_components/ProfileAvartar'
import { ProfileForm } from './_components/ProfileForm'

export default function MerchantProfilePage() {
  const methods = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      image: '',
    },
  })

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUser}
        title="โปรไฟล์ส่วนตัว"
        description="จัดการข้อมูลผู้ใช้งานหลักของคุณ"
      />

      <FormProvider {...methods}>
        <div className="grid gap-5 xl:grid-cols-12">
          <ProfileAvartar className="col-span-1 xl:col-span-4" />
          <ProfileForm className="col-span-1 xl:col-span-8" />
        </div>
      </FormProvider>
    </DashboardSidebar>
  )
}
