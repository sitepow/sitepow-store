'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconUserCog } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { EmployeeDialog } from './_components/EmployeeDialog'
import { EmployeeTable } from './_components/EmployeeTable'

export default function EmployeePage() {
  const { canManageStoreSettings } = useEmployeePermission()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >()
  const [open, setOpen] = useState(false)

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
          <div className="flex items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            {canManageStoreSettings && (
              <EmployeeDialog
                employeeId={selectedEmployeeId}
                open={open}
                setOpen={setOpen}
                onAdd={handleAdd}
              />
            )}
          </div>
        }
      />
      <EmployeeTable onEdit={handleEdit} />
    </DashboardSidebar>
  )
}
