'use client'

import { useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPlus } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CreateProductForm } from './_components/CreateProductForm'

export default function StoreAdminProductNew() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconPlus}
        title="เพิ่มสินค้าใหม่"
        description="กรอกข้อมูลรายละเอียดสินค้า ราคา และจำนวนสต็อกเพื่อบันทึกเข้าสู่ระบบ"
        endContent={
          <StoreSelectField
            value={selectedStoreId}
            onValueChange={setSelectedStoreId}
          />
        }
      />
      <CreateProductForm />
    </DashboardSidebar>
  )
}
