'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconKey, IconTrash } from '@tabler/icons-react'

import { DEFAULT_ROLE_TH } from '@/constants/translate'
import { DefaultRole } from '@/generated/prisma/enums'
import { MultiSelect } from '@/components/MultiSelect'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BranchOption {
  id: string
  name: string
}

interface RoleOption {
  id: string
  name: string
}

interface PermissionOption {
  id: string
  name: string
}

interface EmployeeAssignmentCardProps {
  index: number
  branchId: string
  roleId: string
  permissionIds: string[]
  isPending: boolean
  branches: BranchOption[]
  roles: RoleOption[]
  permissionOptions: PermissionOption[]
  onRemove: () => void
  onBranchChange: (branchId: string) => void
  onRoleChange: (roleId: string) => void
  onPermissionsChange: (permissionIds: string[]) => void
  allAssignments: { branchId: string }[]
}

export function EmployeeAssignmentCard({
  index,
  branchId,
  roleId,
  permissionIds,
  isPending,
  branches,
  roles,
  permissionOptions,
  onRemove,
  onBranchChange,
  onRoleChange,
  onPermissionsChange,
  allAssignments,
}: EmployeeAssignmentCardProps) {
  const t = useTranslations('merchant.employee.dialog')
  const tEmp = useTranslations('merchant.employee')

  const selectableBranches = branches.filter(
    (b) =>
      b.id === branchId ||
      !allAssignments.some((a) => a.branchId === b.id),
  )

  return (
    <div className="bg-card relative grid gap-3 space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-muted border-border flex items-center gap-1 border p-2.5 font-bold">
            <IconKey />
          </div>
          <span>{t('branchNumber', { number: index + 1 })}</span>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          disabled={isPending}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>

      <Field>
        <FieldLabel className="text-xs">{t('branchLabel')}</FieldLabel>
        <Select
          value={branchId}
          disabled={isPending}
          onValueChange={onBranchChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectBranch')} />
          </SelectTrigger>
          <SelectContent>
            {selectableBranches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel className="text-xs">{t('roleLabel')}</FieldLabel>
        <Select
          value={roleId}
          disabled={isPending}
          onValueChange={onRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectRole')} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => {
              const roleLabel = tEmp.has(`roles.${role.name}`)
                ? tEmp(`roles.${role.name}`)
                : DEFAULT_ROLE_TH[role.name as DefaultRole] || role.name

              return (
                <SelectItem key={role.id} value={role.id}>
                  {roleLabel}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel className="text-xs">{t('permissionsLabel')}</FieldLabel>
        <MultiSelect
          options={permissionOptions}
          value={permissionIds}
          onChange={onPermissionsChange}
          disabled={isPending}
          placeholder={t('selectPermissions')}
          allSelectedLabel={t('allPermissions')}
        />
      </Field>
    </div>
  )
}
