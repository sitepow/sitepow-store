'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconBox, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { InventoryTable } from './_components/InventoryTable'

export default function MerchantInventoryPage() {
  const t = useTranslations('merchant.inventory')
  const { selectedStoreId } = useStoreFilter()
  const { canViewInventory, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title={t('title')}
        description={t('description')}
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewInventory ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <InventoryTable />
      )}
    </Sidebar>
  )
}
