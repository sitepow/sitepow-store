'use client'

import { useTranslations } from 'next-intl'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconPackage } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { OrderTable } from './_components/OrderTable'

export default function StoreUserOrderPage() {
  const t = useTranslations('customer.orders')

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconPackage}
        title={t('title')}
        description={t('description')}
      />
      <OrderTable />
    </Sidebar>
  )
}
