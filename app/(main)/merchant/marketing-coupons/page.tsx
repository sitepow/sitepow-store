'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES } from '@/stores/use-store-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconTicket } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CouponListTable } from './_components/CouponListTable'
import { CouponCreateDialog } from './_components/CreateCouponDialog'

export default function MerchantMarketingCouponsPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canManageCoupons, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconTicket}
        title="คูปองส่วนลด"
        description="จัดการรหัสโปรโมชัน เงื่อนไขส่วนลดท้ายบิล เพื่อนำไปจัดแคมเปญส่งเสริมการขายบนหน้า Sale Page และระบบฝั่งหน้าร้าน POS"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {selectedStoreId !== ALL_STORES && canManageCoupons && (
              <CouponCreateDialog />
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canManageCoupons ? (
        <ActionRequiredAlert
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลคูปองส่วนลดของสาขาหรือร้านค้านี้"
        />
      ) : (
        <CouponListTable />
      )}
    </DashboardSidebar>
  )
}
