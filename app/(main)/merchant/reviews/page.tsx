'use client'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconLock, IconStar } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { ReviewTable } from './_components/ReviewTable'

export default function ReviewPage() {
  const { selectedStoreId } = useStoreFilter()

  const { canViewReviews, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconStar}
        title="จัดการรีวิว"
        description="ตรวจสอบและจัดการรีวิวสินค้าจากลูกค้าภายในร้าน"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewReviews ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลรีวิวของสาขาหรือร้านค้านี้"
        />
      ) : (
        <ReviewTable />
      )}
    </Sidebar>
  )
}
