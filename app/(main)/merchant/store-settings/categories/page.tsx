'use client'

import { useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconCategory } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CategoriesTable } from './_components/CategoriesTable'
import { CategoryDialog } from './_components/CategoryDialog'

export default function MerchantStoreSettingsCategoriesPage() {
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
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCategory}
        title="หมวดหมู่สินค้า"
        description="จัดการหมวดหมู่สินค้า เพื่อจัดระเบียบสินค้าในร้านค้าของคุณ"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            <CategoryDialog
              categoryId={selectedCategoryId}
              open={open}
              setOpen={setOpen}
              onAdd={handleAdd}
            />
          </div>
        }
      />
      <CategoriesTable onEdit={handleEdit} />
    </DashboardSidebar>
  )
}
