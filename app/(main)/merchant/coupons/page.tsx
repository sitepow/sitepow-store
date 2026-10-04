'use client'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconTicket } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { CouponListTable } from './_components/CouponListTable'
import { CouponCreateDialog } from './_components/CreateCouponDialog'

export default function MerchantMarketingCouponsPage() {
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewCoupons,
    canCreateCoupons,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconTicket}
        title="คูปองส่วนลด"
        description="จัดการรหัสโปรโมชัน เงื่อนไขส่วนลดท้ายบิล เพื่อนำไปจัดแคมเปญส่งเสริมการขายบนหน้า Sale Page และระบบฝั่งหน้าร้าน POS"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {selectedStoreId !== ALL_STORES && canCreateCoupons && (
              <CouponCreateDialog />
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewCoupons ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลคูปองส่วนลดของสาขาหรือร้านค้านี้"
        />
      ) : (
        <CouponListTable />
      )}
    </Sidebar>
  )
}
