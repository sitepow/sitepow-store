'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import {
  useResetStoreRolePermissions,
  useSyncStoreRolesAndPermissions,
} from '@/actions/store/permission/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { DefaultRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  IconClockRecord,
  IconRefresh,
  IconShieldLock,
  IconUserCog,
  IconX,
} from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { EmployeeDialog } from './_components/EmployeeDialog'
import { EmployeeTable } from './_components/EmployeeTable'
import { PermissionLegendTable } from './_components/PermissionLegendTable'

export default function EmployeePage() {
  const { userId } = useSession()
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { canViewEmployee, isOwner, isRoleOwner } = useEmployeePermission()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >()
  const [open, setOpen] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  const resetPermissionMutation = useResetStoreRolePermissions()
  const syncStoreRolesMutation = useSyncStoreRolesAndPermissions()

  const handleEdit = (id: string) => {
    setSelectedEmployeeId(id)
    setOpen(true)
  }

  const handleAdd = () => {
    setSelectedEmployeeId(undefined)
    setOpen(true)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUserCog}
        title="จัดการพนักงาน"
        description="จัดการพนักงานและบทบาทการเข้าถึงระบบของร้านค้า"
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            {canViewEmployee && (
              <>
                <EmployeeDialog
                  employeeId={selectedEmployeeId}
                  open={open}
                  setOpen={setOpen}
                  onAdd={handleAdd}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPermissions((prev) => !prev)}
                >
                  {showPermissions ? <IconX /> : <IconShieldLock />}
                  {showPermissions
                    ? 'ซ่อนตารางอ้างอิงสิทธิ์'
                    : 'แสดงตารางอ้างอิงสิทธิ์'}
                </Button>
              </>
            )}
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  disabled={isRoleOwner}
                  onClick={async () => {
                    await resetPermissionMutation.mutate({
                      storeId: selectedStoreId,
                      employeeId: userId!,
                      roleName: DefaultRole.OWNER,
                      branchId: selectedBranchId,
                    })
                  }}
                >
                  <IconClockRecord /> กู้คืนค่าเริ่มต้นสิทธิ์เจ้าของร้าน
                </Button>
                <Button
                  variant="outline"
                  disabled={syncStoreRolesMutation.isPending}
                  onClick={async () => {
                    await syncStoreRolesMutation.mutate({
                      storeId: selectedStoreId,
                    })
                  }}
                >
                  <IconRefresh
                    className={
                      syncStoreRolesMutation.isPending ? 'animate-spin' : ''
                    }
                  />
                  {syncStoreRolesMutation.isPending
                    ? 'กำลังซิงค์สิทธิ์...'
                    : 'ซิงค์สิทธิ์ Role ทั้งหมด'}
                </Button>
              </>
            )}
          </div>
        }
      />
      {showPermissions && canViewEmployee && <PermissionLegendTable />}
      <EmployeeTable onEdit={handleEdit} />
    </Sidebar>
  )
}
