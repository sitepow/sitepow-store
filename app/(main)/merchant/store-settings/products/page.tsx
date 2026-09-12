'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconBox,
  IconFileSpreadsheet,
  IconLock,
  IconPlus,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { BulkImportProductsDialog } from './_components/BulkImportProductsDialog'
import { ProductsTable } from './_components/ProductsTable'

export default function MerchantStoreSettingsProductsPage() {
  const t = useTranslations('merchant.products')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewProducts,
    canCreateProducts,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)

  const isStoreSelected = selectedStoreId && selectedStoreId !== ALL_STORES

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-3">
            <StoreSelectField />
            {canCreateProducts && (
              <>
                <Button
                  variant="outline"
                  disabled={!isStoreSelected}
                  onClick={() => setIsBulkImportOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <IconFileSpreadsheet className="h-4 w-4" />
                  {t('bulkImportBtn')}
                </Button>
                <Button asChild>
                  <Link href={'/merchant/store-settings/products/create'}>
                    <IconPlus />
                    {t('addProduct')}
                  </Link>
                </Button>
              </>
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

      <BulkImportProductsDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        storeId={selectedStoreId}
      />
    </Sidebar>
  )
}
