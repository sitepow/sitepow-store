'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconFileDescription, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { StorePagesForm } from './_components/StorePagesForm'

export default function MerchantStorePagesPage() {
  const t = useTranslations('merchant.storePages')
  const { canViewStoreSettings, isLoading: isPermissionLoading } =
    useEmployeePermission()
  const { selectedStoreId } = useStoreFilter()

  const isStoreSelected = selectedStoreId && selectedStoreId !== ALL_STORES

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconFileDescription}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:items-end">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />
      {isPermissionLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !canViewStoreSettings ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : !isStoreSelected ? (
        <ActionRequiredAlert
          icon={<IconFileDescription />}
          title={t('selectStoreTitle')}
          description={t('selectStoreDescription')}
        />
      ) : (
        <StorePagesForm storeId={selectedStoreId as string} />
      )}
    </Sidebar>
  )
}
