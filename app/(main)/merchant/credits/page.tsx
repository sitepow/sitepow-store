'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconWallet } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { CreditHistoryTable } from './_components/CreditHistoryTable'
import { StoreCreditCard } from './_components/StoreCreditCard'

export default function CreditPage() {
  const t = useTranslations('merchant.credits')
  const { selectedStoreId } = useStoreFilter()
  const { canViewCreditCard, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconWallet}
        title={t('title')}
        description={t('description')}
        endContent={<StoreSelectField />}
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewCreditCard ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <StoreCreditCard />
          <div className="xl:col-span-2">
            <CreditHistoryTable />
          </div>
        </div>
      )}
    </Sidebar>
  )
}
