'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import {
  useResetStoreRolePermissions,
  useSyncStoreRolesAndPermissions,
} from '@/actions/hooks/permission'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
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
        title={t('title')}
        description={t('description')}
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
                    ? t('hidePermissions')
                    : t('showPermissions')}
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
                  <IconClockRecord /> {t('resetOwnerPermissions')}
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
                    ? t('syncingPermissions')
                    : t('syncRoles')}
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
