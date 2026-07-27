'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconEye, IconEyeOff, IconUserCog } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Button } from '@/components/ui/button'

import { EmployeeDialog } from './_components/EmployeeDialog'
import { EmployeeTable } from './_components/EmployeeTable'
import { PermissionLegendTable } from './_components/PermissionLegendTable'

export default function EmployeePage() {
  const { canManageEmployee } = useEmployeePermission()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >()
  const [open, setOpen] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  const handleEdit = (id: string) => {
    setSelectedEmployeeId(id)
    setOpen(true)
  }

  const handleAdd = () => {
    setSelectedEmployeeId(undefined)
    setOpen(true)
  }

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUserCog}
        title="จัดการพนักงาน"
        description="จัดการพนักงานและบทบาทการเข้าถึงระบบของร้านค้า"
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            {canManageEmployee && (
              <EmployeeDialog
                employeeId={selectedEmployeeId}
                open={open}
                setOpen={setOpen}
                onAdd={handleAdd}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPermissions((prev) => !prev)}
            >
              {showPermissions ? (
                <IconEyeOff className="mr-1.5 size-4" />
              ) : (
                <IconEye className="mr-1.5 size-4" />
              )}
              {showPermissions
                ? 'ซ่อนตารางอ้างอิงสิทธิ์'
                : 'แสดงตารางอ้างอิงสิทธิ์'}
            </Button>
          </div>
        }
      />
      {showPermissions && <PermissionLegendTable />}
      <EmployeeTable onEdit={handleEdit} />
    </DashboardSidebar>
  )
}
