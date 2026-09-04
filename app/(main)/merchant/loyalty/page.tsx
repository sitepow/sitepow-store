'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCoin, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { CustomerPointsTable } from './_components/CustomerPointsTable'
import { LoyaltySettingsCard } from './_components/LoyaltySettingsCard'

export default function MerchantLoyaltyPage() {
  const t = useTranslations('merchant.loyalty')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewStoreSettings,
    canViewCustomers,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCoin}
        title={t('title')}
        description={t('description')}
        endContent={<StoreSelectField />}
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewCustomers ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
          {canViewStoreSettings && (
            <LoyaltySettingsCard className="xl:col-span-4" />
          )}
          <CustomerPointsTable
            className={
              canViewStoreSettings ? 'xl:col-span-8' : 'xl:col-span-12'
            }
          />
        </div>
      )}
    </Sidebar>
  )
}
