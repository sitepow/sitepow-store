'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconCategory, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { CategoriesTable } from './_components/CategoriesTable'
import { CategoryDialog } from './_components/CategoryDialog'

export default function MerchantStoreSettingsCategoriesPage() {
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
        title="หมวดหมู่สินค้า"
        description="จัดการหมวดหมู่สินค้า เพื่อจัดระเบียบสินค้าในร้านค้าของคุณ"
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
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลหมวดหมู่สินค้าของสาขาหรือร้านค้านี้"
        />
      ) : (
        <CategoriesTable onEdit={handleEdit} />
      )}
    </Sidebar>
  )
}
