'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconStar } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { ReviewTable } from './_components/ReviewTable'

export default function ReviewPage() {
  const t = useTranslations('merchant.reviews')
  const { selectedStoreId } = useStoreFilter()

  const { canViewReviews, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconStar}
        title={t('title')}
        description={t('description')}
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewReviews ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <ReviewTable />
      )}
    </Sidebar>
  )
}
