'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconTicket } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { CouponListTable } from './_components/CouponListTable'
import { CouponCreateDialog } from './_components/CreateCouponDialog'

export default function MerchantMarketingCouponsPage() {
  const t = useTranslations('merchant.marketing')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewCoupons,
    canCreateCoupons,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconTicket}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {selectedStoreId !== ALL_STORES && canCreateCoupons && (
              <CouponCreateDialog />
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewCoupons ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <CouponListTable />
      )}
    </Sidebar>
  )
}
