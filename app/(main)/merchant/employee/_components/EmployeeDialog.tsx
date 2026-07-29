'use client'

import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { useBranchOptions } from '@/actions/hooks/branch'
import {
  useCreateEmployee,
  useEmployee,
  useUpdateEmployee,
} from '@/actions/hooks/employee'
import { usePermissions, useRoleOptions } from '@/actions/hooks/role'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  getPresetPermissionIds,
  mapEmployeeDataToFormValues,
} from '@/utils/employee'
import { createEmployeeSchema } from '@/zod/employee'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { MultiSelect } from '@/components/MultiSelect'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const DEFAULT_VALUES = {
  name: '',
  email: '',
  assignments: [] as {
    branchId: string
    roleId: string
    permissionIds: string[]
  }[],
}

export function EmployeeDialog({
  employeeId,
  open,
  setOpen,
  onAdd,
}: {
  employeeId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}) {
  const { selectedStoreId } = useStoreFilter()
  const createEmployeeMutation = useCreateEmployee()
  const updateEmployeeMutation = useUpdateEmployee()
  const { data: branches = [] } = useBranchOptions(selectedStoreId)
  const { data: roles = [] } = useRoleOptions(selectedStoreId)
  const { data: allPermissions = [] } = usePermissions()

  const { data: employeeData } = useEmployee(employeeId!)

  const form = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assignments',
  })

  useEffect(() => {
    reset(mapEmployeeDataToFormValues(employeeData))
  }, [employeeData, reset])

  const handleClose = () => {
    reset(DEFAULT_VALUES)
    setOpen(false)
  }

  const handleReset = () => {
    reset(mapEmployeeDataToFormValues(employeeData))
  }

  const handleRoleChange = (index: number, roleId: string) => {
    setValue(`assignments.${index}.roleId`, roleId, {
      shouldValidate: true,
    })

    const selectedRole = roles.find((r) => r.id === roleId)
    if (selectedRole?.name) {
      const presetPermissionIds = getPresetPermissionIds(
        selectedRole.name,
        allPermissions,
      )

      setValue(`assignments.${index}.permissionIds`, presetPermissionIds, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const onSubmit = (values: {
    name: string
    email?: string
    assignments: {
      branchId: string
      roleId: string
      permissionIds: string[]
    }[]
  }) => {
    if (employeeId) {
      updateEmployeeMutation.mutate(
        {
          id: employeeId,
          input: {
            storeId: selectedStoreId,
            name: values.name,
            assignments: values.assignments,
          },
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    } else {
      createEmployeeMutation.mutate(
        {
          storeId: selectedStoreId as string,
          name: values.name,
          email: values.email ?? '',
          assignments: values.assignments,
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    }
  }

  const assignments = watch('assignments') ?? []
  const isPending =
    createEmployeeMutation.isPending || updateEmployeeMutation.isPending

  const permissionOptions = allPermissions.map((p) => ({
    id: p.id,
    name: `${p.domain}_${p.action}`,
  }))

  const availableBranches = branches.filter(
    (b) => !assignments.some((a) => a.branchId === b.id),
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        else setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" onClick={onAdd}>
          <IconPlus />
          เพิ่มพนักงาน
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {employeeId ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field>
            <FieldLabel>ชื่อพนักงาน</FieldLabel>
            <Input
              placeholder="เช่น สมชาย ใจดี"
              {...register('name')}
              disabled={isPending || !!employeeId}
            />
            <FieldError>{errors?.name?.message as string}</FieldError>
          </Field>
          <Field>
            <FieldLabel>อีเมล</FieldLabel>
            <Input
              type="email"
              placeholder="เช่น employee@example.com"
              {...register('email')}
              disabled={isPending || !!employeeId}
            />
            <FieldError>{errors?.email?.message}</FieldError>
          </Field>
          <div className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-semibold">
                การกำหนดสาขา บทบาท และสิทธิ์
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
                <IconPlus className="mr-1 size-4" /> เพิ่มสาขาที่ดูแล
              </Button>
            </div>
            {fields.length === 0 && (
              <ActionRequiredAlert
                title="แจ้งเตือน"
                description="สาขานี้ยังไม่มีการตั้งค่า Permission กรุณากำหนดสิทธิ์ก่อนดำเนินการต่อ"
              />
            )}
            {fields.map((fieldItem, index) => {
              const currentBranchId = assignments[index]?.branchId
              const currentRoleId = assignments[index]?.roleId
              const currentPermissionIds =
                assignments[index]?.permissionIds ?? []

              const selectableBranchesForThisRow = branches.filter(
                (b) =>
                  b.id === currentBranchId ||
                  !assignments.some((a) => a.branchId === b.id),
              )

              return (
                <div
                  key={fieldItem.id}
                  className="bg-card relative grid gap-3 space-y-2 rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span>สาขาที่ {index + 1}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isPending}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                  <Field>
                    <FieldLabel className="text-xs">สาขา</FieldLabel>
                    <Select
                      value={currentBranchId}
                      disabled={isPending}
                      onValueChange={(branchId) =>
                        setValue(`assignments.${index}.branchId`, branchId, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขา" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableBranchesForThisRow.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">บทบาทประจำสาขา</FieldLabel>
                    <Select
                      value={currentRoleId}
                      disabled={isPending}
                      onValueChange={(roleId) =>
                        handleRoleChange(index, roleId)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกบทบาท" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">
                      สิทธิ์การใช้งานเพิ่มเติม (Permissions)
                    </FieldLabel>
                    <MultiSelect
                      options={permissionOptions}
                      value={currentPermissionIds}
                      onChange={(v) =>
                        setValue(`assignments.${index}.permissionIds`, v, {
                          shouldValidate: true,
                        })
                      }
                      disabled={isPending}
                      placeholder="เลือกสิทธิ์การใช้งาน"
                      allSelectedLabel="ทุกสิทธิ์"
                    />
                  </Field>
                </div>
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
                ล้างการตั้งค่า
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
            )}
            <Button disabled={isPending} onClick={handleSubmit(onSubmit)}>
              {isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : employeeId ? (
                'บันทึกการแก้ไข'
              ) : (
                'เพิ่มพนักงาน'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
