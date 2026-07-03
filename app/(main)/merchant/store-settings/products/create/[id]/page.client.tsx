'use client'

import Link from 'next/link'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconPlus } from '@tabler/icons-react'
import { ArrowLeftIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Button } from '@/components/ui/button'

import { BranchCreateDialog } from '../../../../organization-branches/_components/BranchCreateDialog'
import { CategoryCreateDialog } from '../../../categories/_components/CategoryCreateDialog'
import { CreateProductForm } from '../_components/CreateProductForm'

interface StoreAdminProductNewClientProps {
  productId?: string
}

export function StoreAdminProductNewClient({
  productId,
}: StoreAdminProductNewClientProps) {
  const { selectedStoreId } = useStoreFilter()
  const isMounted = useIsMounted()

  if (!isMounted) {
    return
  }

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
            {selectedStoreId !== ALL_STORES && (
              <>
                <CategoryCreateDialog />
                <BranchCreateDialog />
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
    </DashboardSidebar>
  )
}
