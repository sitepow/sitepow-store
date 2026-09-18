'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useSession } from '@/hooks/use-session'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconUserCog } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { EmployeeHeaderActions } from './_components/EmployeeHeaderActions'
import { EmployeeTable } from './_components/EmployeeTable'
import { PermissionLegendTable } from './_components/PermissionLegendTable'

export default function EmployeePage() {
  const t = useTranslations('merchant.employee')
  const { userId } = useSession()
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { canViewEmployee, isOwner, isRoleOwner } = useEmployeePermission()
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
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUserCog}
        title={t('title')}
        description={t('description')}
        endContent={
          <EmployeeHeaderActions
            canViewEmployee={canViewEmployee}
            isOwner={isOwner}
            isRoleOwner={isRoleOwner}
            selectedEmployeeId={selectedEmployeeId}
            dialogOpen={open}
            setDialogOpen={setOpen}
            onAddEmployee={handleAdd}
            showPermissions={showPermissions}
            onTogglePermissions={() => setShowPermissions((prev) => !prev)}
            selectedStoreId={selectedStoreId}
            selectedBranchId={selectedBranchId}
            userId={userId}
          />
        }
      />
      {showPermissions && canViewEmployee && <PermissionLegendTable />}
      <EmployeeTable onEdit={handleEdit} />
    </Sidebar>
  )
}
