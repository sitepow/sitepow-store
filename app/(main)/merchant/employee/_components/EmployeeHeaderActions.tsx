'use client'

import { useTranslations } from 'next-intl'

import {
  useResetStoreRolePermissions,
  useSyncStoreRolesAndPermissions,
} from '@/actions/hooks/permission'
import { DefaultRole } from '@/generated/prisma/enums'
import {
  IconClockRecord,
  IconRefresh,
  IconShieldLock,
  IconX,
} from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'

import { EmployeeDialog } from './EmployeeDialog'

interface EmployeeHeaderActionsProps {
  canViewEmployee: boolean
  isOwner: boolean
  isRoleOwner: boolean
  selectedEmployeeId?: string
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onAddEmployee: () => void
  showPermissions: boolean
  onTogglePermissions: () => void
  selectedStoreId: string
  selectedBranchId: string
  userId?: string | null
}

export function EmployeeHeaderActions({
  canViewEmployee,
  isOwner,
  isRoleOwner,
  selectedEmployeeId,
  dialogOpen,
  setDialogOpen,
  onAddEmployee,
  showPermissions,
  onTogglePermissions,
  selectedStoreId,
  selectedBranchId,
  userId,
}: EmployeeHeaderActionsProps) {
  const t = useTranslations('merchant.employee')
  const resetPermissionMutation = useResetStoreRolePermissions()
  const syncStoreRolesMutation = useSyncStoreRolesAndPermissions()

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <StoreSelectField />
      <BranchSelectField />
      {canViewEmployee && (
        <>
          <EmployeeDialog
            employeeId={selectedEmployeeId}
            open={dialogOpen}
            setOpen={setDialogOpen}
            onAdd={onAddEmployee}
          />
          <Button variant="outline" size="sm" onClick={onTogglePermissions}>
            {showPermissions ? <IconX /> : <IconShieldLock />}
            {showPermissions ? t('hidePermissions') : t('showPermissions')}
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
              className={syncStoreRolesMutation.isPending ? 'animate-spin' : ''}
            />
            {syncStoreRolesMutation.isPending
              ? t('syncingPermissions')
              : t('syncRoles')}
          </Button>
        </>
      )}
    </div>
  )
}
