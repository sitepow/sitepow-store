'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useBranchOptions } from '@/actions/hooks/branch'
import {
  useCreateEmployee,
  useEmployee,
  useUpdateEmployee,
} from '@/actions/hooks/employee'
import { usePermissions, useRoleOptions } from '@/actions/hooks/role'
import { useStoreFilter } from '@/stores/use-store-filter'
import { createEmployeeSchema } from '@/zod/employee'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus, IconX } from '@tabler/icons-react'

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
  roleId: '',
  branchIds: [],
  permissionIds: [],
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (employeeData) {
      const rolePermissions = employeeData.role?.permissions ?? []
      const extractedPermissionIds = rolePermissions.map(
        (rp: { permission: { id: string } }) => rp.permission.id,
      )

      reset({
        name: employeeData.employee?.name ?? '',
        email: employeeData.employee?.email ?? '',
        roleId: employeeData.role?.id ?? '',
        branchIds: employeeData.branches?.map((b) => b.branch.id) ?? [],
        permissionIds: extractedPermissionIds,
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [employeeData, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const handleReset = () => {
    if (employeeData) {
      const rolePermissions = employeeData.role?.permissions ?? []
      const extractedPermissionIds = rolePermissions.map(
        (rp: { permission: { id: string } }) => rp.permission.id,
      )

      reset({
        name: employeeData.employee?.name ?? '',
        email: employeeData.employee?.email ?? '',
        roleId: employeeData.role?.id ?? '',
        branchIds: employeeData.branches?.map((b) => b.branch.id) ?? [],
        permissionIds: extractedPermissionIds,
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }

  const onSubmit = (values: {
    name: string
    email?: string
    roleId: string
    branchIds: string[]
    permissionIds: string[]
  }) => {
    if (employeeId) {
      updateEmployeeMutation.mutate(
        {
          id: employeeId,
          input: {
            name: values.name,
            roleId: values.roleId,
            branchIds: values.branchIds ?? [],
            permissionIds: values.permissionIds ?? [],
            storeId: selectedStoreId,
          },
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    } else {
      createEmployeeMutation.mutate(
        {
          name: values.name,
          email: values.email ?? '',
          roleId: values.roleId,
          storeId: selectedStoreId as string,
          branchIds: values.branchIds ?? [],
          permissionIds: values.permissionIds ?? [],
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    }
  }

  const currentRoleId = watch('roleId')
  const selectedBranchIds = watch('branchIds') ?? []
  const selectedPermissionIds = watch('permissionIds') ?? []

  const isPending =
    createEmployeeMutation.isPending || updateEmployeeMutation.isPending

  const permissionOptions = allPermissions.map((p) => ({
    id: p.id,
    name: `${p.domain}_${p.action}`,
  }))

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
      <DialogContent className="sm:max-w-lg">
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
            <FieldError>{errors?.name?.message}</FieldError>
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
          <Field>
            <FieldLabel>บทบาท</FieldLabel>
            <Select
              value={currentRoleId}
              disabled={isPending}
              onValueChange={(v) =>
                setValue('roleId', v, { shouldValidate: true })
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
            <FieldError>{errors?.roleId?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>กำหนดสิทธิ์การใช้งาน (Permissions)</FieldLabel>
            <MultiSelect
              options={permissionOptions}
              value={selectedPermissionIds}
              onChange={(v) =>
                setValue('permissionIds', v, { shouldValidate: true })
              }
              disabled={isPending}
              placeholder="เลือกสิทธิ์การใช้งาน"
              allSelectedLabel="ทุกสิทธิ์"
            />
            <FieldError>{errors?.permissionIds?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>สาขาที่ดูแล</FieldLabel>
            <MultiSelect
              options={branches}
              value={selectedBranchIds}
              onChange={(v) =>
                setValue('branchIds', v, { shouldValidate: true })
              }
              disabled={isPending}
              placeholder="เลือกสาขา"
              allSelectedLabel="ทุกสาขา"
            />
            <FieldError>{errors?.branchIds?.message}</FieldError>
          </Field>
        </div>
        <DialogFooter className="mt-2 flex items-center justify-between border-t pt-4">
          <div>
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
              >
                <IconX className="mr-1 size-4" />
                ล้างการตั้งค่า
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
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
