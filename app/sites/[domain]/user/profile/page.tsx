'use client'

import { useTranslations } from 'next-intl'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { BuyerProfileAvatar } from './_components/BuyerProfileAvatar'
import { BuyerProfileForm } from './_components/BuyerProfileForm'

export default function StoreUserProfilePage() {
  const t = useTranslations('customer.profile')

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconUser}
        title={t('title')}
        description={t('description')}
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BuyerProfileAvatar className="col-span-1 xl:col-span-4" />
        <BuyerProfileForm className="col-span-1 xl:col-span-8" />
      </div>
    </Sidebar>
  )
}
