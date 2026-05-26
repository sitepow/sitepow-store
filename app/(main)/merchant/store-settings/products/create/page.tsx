'use client'

import { useState } from 'react'

import Link from 'next/link'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPlus } from '@tabler/icons-react'
import { ArrowLeftIcon } from 'lucide-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Button } from '@/components/ui/button'

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
          <div className="flex flex-wrap items-end gap-5">
            <Button asChild variant="outline">
              <Link href="/merchant/store-settings/products">
                <ArrowLeftIcon /> ย้อนกลับ
              </Link>
            </Button>
            <StoreSelectField
              value={selectedStoreId}
              onValueChange={setSelectedStoreId}
            />
          </div>
        }
      />
      <CreateProductForm />
    </DashboardSidebar>
  )
}
