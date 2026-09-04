'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { UpdateProfileSchema, updateProfileSchema } from '@/zod/profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { ProfileAvartar } from './_components/ProfileAvartar'
import { ProfileForm } from './_components/ProfileForm'

export default function MerchantProfilePage() {
  const t = useTranslations('merchant.profile')
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
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUser}
        title={t('title')}
        description={t('description')}
      />
      <FormProvider {...methods}>
        <div className="grid gap-5 xl:grid-cols-12">
          <ProfileAvartar className="col-span-1 xl:col-span-4" />
          <ProfileForm className="col-span-1 xl:col-span-8" />
        </div>
      </FormProvider>
    </Sidebar>
  )
}
