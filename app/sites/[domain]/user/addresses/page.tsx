'use client'

import { useTranslations } from 'next-intl'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconMapPin } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { CustomerAddressCreateDialog } from '../../cart/_components/CustomerAddressCreateDialog'
import { AddressTable } from './_components/AddressTable'

export default function StoreUserAddressesPage() {
  const t = useTranslations('customer.addresses')

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconMapPin}
        title={t('title')}
        description={t('description')}
        endContent={<CustomerAddressCreateDialog />}
      />
      <AddressTable />
    </Sidebar>
  )
}
