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
  IconSparkles,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { AiAffiliateProductDialog } from './_components/AiAffiliateProductDialog'
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

  const [isAiAffiliateOpen, setIsAiAffiliateOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)

  const isStoreSelected = selectedStoreId && selectedStoreId !== ALL_STORES

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto sm:gap-3">
            <div className="w-full sm:w-auto">
              <StoreSelectField />
            </div>
            {canCreateProducts && (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  disabled={!isStoreSelected}
                  onClick={() => setIsAiAffiliateOpen(true)}
                  className="border-primary/30 text-primary hover:bg-primary/5 flex flex-1 items-center justify-center gap-1.5 text-xs sm:flex-initial sm:text-sm"
                >
                  <IconSparkles className="h-4 w-4 shrink-0" />
                  <span>{t('aiAffiliateBtn')}</span>
                </Button>
                <Button
                  variant="outline"
                  disabled={!isStoreSelected}
                  onClick={() => setIsBulkImportOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 text-xs sm:flex-initial sm:text-sm"
                >
                  <IconFileSpreadsheet className="h-4 w-4 shrink-0" />
                  <span>{t('bulkImportBtn')}</span>
                </Button>
                <Button asChild className="w-full text-xs sm:w-auto sm:text-sm">
                  <Link href={'/merchant/store-settings/products/create'}>
                    <IconPlus className="h-4 w-4 shrink-0" />
                    <span>{t('addProduct')}</span>
                  </Link>
                </Button>
              </div>
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

      <AiAffiliateProductDialog
        open={isAiAffiliateOpen}
        onOpenChange={setIsAiAffiliateOpen}
        storeId={selectedStoreId}
      />

      <BulkImportProductsDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        storeId={selectedStoreId}
      />
    </Sidebar>
  )
}
