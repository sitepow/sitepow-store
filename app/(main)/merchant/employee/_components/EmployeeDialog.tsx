'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconPlus, IconUserPlus, IconX } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { useEmployeeDialogForm } from '../_hooks/use-employee-dialog-form'
import { EmployeeAssignmentCard } from './EmployeeAssignmentCard'

interface EmployeeDialogProps {
  employeeId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}

export function EmployeeDialog({
  employeeId,
  open,
  setOpen,
  onAdd,
}: EmployeeDialogProps) {
  const t = useTranslations('merchant.employee.dialog')

  const {
    currentStore,
    store,
    register,
    handleSubmit,
    errors,
    isDirty,
    isPending,
    fields,
    append,
    remove,
    assignments,
    branches,
    roles,
    permissionOptions,
    availableBranches,
    setValue,
    handleRoleChange,
    handleClose,
    handleReset,
  } = useEmployeeDialogForm({
    employeeId,
    open,
    setOpen,
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        else setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={onAdd}>
          <IconPlus />
          {t('addEmployee')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconUserPlus}
            title={employeeId ? t('editTitle') : t('createTitle')}
          />
        </DialogHeader>
        <div className="grid gap-4">
          <Field>
            <FieldLabel>{t('nameLabel')}</FieldLabel>
            <Input
              placeholder={t('namePlaceholder')}
              {...register('name')}
              disabled={isPending || !!employeeId}
            />
            <FieldError>{errors?.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t('emailLabel')}</FieldLabel>
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              {...register('email')}
              disabled={isPending || !!employeeId}
            />
            <FieldError>{errors?.email?.message}</FieldError>
          </Field>
          <div className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-semibold">
                {t('assignmentsTitle')}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || availableBranches.length === 0}
                onClick={() =>
                  append({ branchId: '', roleId: '', permissionIds: [] })
                }
              >
                <IconPlus className="mr-1 size-4" /> {t('addBranchAssignment')}
              </Button>
            </div>
            {fields.length === 0 && (
              <ActionRequiredAlert
                title={t('alertTitle')}
                description={t('alertDescription')}
              />
            )}
            {fields.map((fieldItem, index) => {
              const currentBranchId = assignments[index]?.branchId ?? ''
              const currentRoleId = assignments[index]?.roleId ?? ''
              const currentPermissionIds =
                assignments[index]?.permissionIds ?? []

              return (
                <EmployeeAssignmentCard
                  key={fieldItem.id}
                  index={index}
                  branchId={currentBranchId}
                  roleId={currentRoleId}
                  permissionIds={currentPermissionIds}
                  isPending={isPending}
                  branches={branches}
                  roles={roles}
                  permissionOptions={permissionOptions}
                  allAssignments={assignments}
                  onRemove={() => remove(index)}
                  onBranchChange={(branchId) =>
                    setValue(`assignments.${index}.branchId`, branchId, {
                      shouldValidate: true,
                    })
                  }
                  onRoleChange={(roleId) => handleRoleChange(index, roleId)}
                  onPermissionsChange={(permissionIds) =>
                    setValue(
                      `assignments.${index}.permissionIds`,
                      permissionIds,
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                />
              )
            })}
          </div>
        </div>
        <DialogFooter className="mt-2 flex items-end justify-between border-t pt-4">
          <div className="flex gap-2">
            {isDirty ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
              >
                <IconX className="mr-1 size-4" />
                {t('reset')}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
            )}
            <Button disabled={isPending} onClick={handleSubmit}>
              {isPending ? (
                <>
                  <Spinner /> {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
