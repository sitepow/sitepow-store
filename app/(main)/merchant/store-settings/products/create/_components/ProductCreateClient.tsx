'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { BranchDialog } from '@/app/(main)/merchant/organization-branches/_components/BranchDialog'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit, IconPlus } from '@tabler/icons-react'
import { ArrowLeftIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { CategoryDialog } from '../../../categories/_components/CategoryDialog'
import { CreateProductForm } from '../_components/CreateProductForm'

interface ProductCreateClientProps {
  productId?: string
}

export function ProductCreateClient({ productId }: ProductCreateClientProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products.form')
  const [openCategory, setOpenCategory] = useState(false)
  const [openBranch, setOpenBranch] = useState(false)

  const { selectedStoreId } = useStoreFilter()
  const isMounted = useIsMounted()

  if (!isMounted) {
    return
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <div
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
      >
        <PageTabHeader
          icon={productId ? IconEdit : IconPlus}
          title={productId ? t('editTitle') : t('createTitle')}
          description={t('createDescription')}
          endContent={
            <div className="flex flex-wrap items-end gap-5">
              <Button asChild variant="outline">
                <Link href="/merchant/store-settings/products">
                  <ArrowLeftIcon /> {t('back')}
                </Link>
              </Button>
              {selectedStoreId !== ALL_STORES && (
                <>
                  <CategoryDialog
                    open={openCategory}
                    setOpen={setOpenCategory}
                  />
                  <BranchDialog open={openBranch} setOpen={setOpenBranch} />
                </>
              )}
              <StoreSelectField />
            </div>
          }
        />
        {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
        {selectedStoreId !== ALL_STORES && (
          <CreateProductForm productId={productId} />
        )}
      </div>
    </Sidebar>
  )
}
