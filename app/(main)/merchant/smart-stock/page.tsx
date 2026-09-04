'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCpu, IconExternalLink, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { SmartStockOverviewCards } from './_components/SmartStockOverviewCards'
import { SmartStockTable } from './_components/SmartStockTable'

export default function MerchantSmartStockPage() {
  const t = useTranslations('merchant.smartStock')
  const { selectedStoreId } = useStoreFilter()
  const { canViewInventory, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [hasMismatch, setHasMismatch] = useState(true)

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCpu}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            <Button variant="outline" size="sm" asChild>
              <Link href="/merchant/settings?tab=marketplace">
                {t('apiSettings')}{' '}
                <IconExternalLink className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewInventory ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <div className="space-y-6">
          <SmartStockOverviewCards />
          {hasMismatch && (
            <ActionRequiredAlert
              variant="warning"
              title={t('mismatchAlert.title', { count: 1 })}
              description={t('mismatchAlert.description', {
                product: 'แก้วเก็บความเย็นสแตนเลส 30oz (TUMBLER-30-BLK)',
              })}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHasMismatch(false)}
                >
                  {t('acknowledged')}
                </Button>
              }
            />
          )}
          <ActionRequiredAlert
            variant="info"
            title={t('sharedPoolAlert.title')}
            description={t('sharedPoolAlert.description')}
            action={
              <Button size="sm" variant="outline">
                {t('acknowledged')}
              </Button>
            }
          />
          <SmartStockTable onMismatchResolved={() => setHasMismatch(false)} />
        </div>
      )}
    </Sidebar>
  )
}
