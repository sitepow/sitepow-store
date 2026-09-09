'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconBox, IconLock, IconPlus } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { ProductsTable } from './_components/ProductsTable'

export default function MerchantStoreSettingsProductsPage() {
  const t = useTranslations('merchant.products')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewProducts,
    canCreateProducts,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {canCreateProducts && (
              <Button asChild>
                <Link href={'/merchant/store-settings/products/create'}>
                  <IconPlus />
                  {t('addProduct')}
                </Link>
              </Button>
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewProducts ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <ProductsTable />
      )}
    </Sidebar>
  )
}
