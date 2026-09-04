'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCategory, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { CategoriesTable } from './_components/CategoriesTable'
import { CategoryDialog } from './_components/CategoryDialog'

export default function MerchantStoreSettingsCategoriesPage() {
  const t = useTranslations('merchant.categories')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewCategory,
    canCreateCategory,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >()
  const [open, setOpen] = useState(false)

  const handleEdit = (id: string) => {
    setSelectedCategoryId(id)
    setOpen(true)
  }

  const handleAdd = () => {
    setSelectedCategoryId(undefined)
    setOpen(true)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCategory}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {canCreateCategory && (
              <CategoryDialog
                categoryId={selectedCategoryId}
                open={open}
                setOpen={setOpen}
                onAdd={handleAdd}
              />
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewCategory ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <CategoriesTable onEdit={handleEdit} />
      )}
    </Sidebar>
  )
}
