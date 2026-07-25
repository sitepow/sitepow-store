'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useBranchOptions } from '@/actions/hooks/branch'
import { useCreateStaff, useStaff, useUpdateStaff } from '@/actions/hooks/staff'
import { STAFF_ROLE_TH } from '@/constants/translate'
import { StaffRole } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CreateStaffFormValues, createStaffSchema } from '@/zod/staff'
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

const DEFAULT_VALUES: CreateStaffFormValues = {
  name: '',
  email: '',
  role: StaffRole.CASHIER,
  branchIds: [],
}

export function StaffDialog({
  staffId,
  open,
  setOpen,
  onAdd,
}: {
  staffId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}) {
  const { selectedStoreId } = useStoreFilter()
  const createStaffMutation = useCreateStaff()
  const updateStaffMutation = useUpdateStaff()
  const { data: branches = [] } = useBranchOptions(selectedStoreId)

  const { data: staffData } = useStaff(staffId!)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (staffData) {
      reset({
        name: staffData.staff.name ?? '',
        email: staffData.staff.email ?? '',
        role: staffData.role,
        branchIds: staffData.branches.map((b) => b.branch.id) ?? [],
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [staffData, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const handleReset = () => {
    if (staffData) {
      reset({
        name: staffData.staff.name ?? '',
        email: staffData.staff.email ?? '',
        role: staffData.role,
        branchIds: staffData.branches.map((b) => b.branch.id) ?? [],
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }

  const onSubmit = (values: CreateStaffFormValues) => {
    if (staffId) {
      updateStaffMutation.mutate(
        {
          id: staffId,
          input: {
            name: values.name,
            role: values.role,
            branchIds: values.branchIds ?? [],
            storeId: selectedStoreId,
          },
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    } else {
      createStaffMutation.mutate(
        {
          ...values,
          storeId: selectedStoreId as string,
          branchIds: values.branchIds ?? [],
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    }
  }

  const selectedBranchIds = watch('branchIds') ?? []
  const isPending =
    createStaffMutation.isPending || updateStaffMutation.isPending

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {staffId ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>ชื่อพนักงาน</FieldLabel>
            </div>
            <Input
              placeholder="เช่น สมชาย ใจดี"
              {...register('name')}
              disabled={isPending}
            />
            <FieldError>{errors?.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>อีเมล</FieldLabel>
            <Input
              type="email"
              placeholder="เช่น staff@example.com"
              {...register('email')}
              disabled={isPending || !!staffId}
            />
            <FieldError>{errors?.email?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>บทบาท</FieldLabel>
            <Select
              value={watch('role')}
              disabled={isPending}
              onValueChange={(v) =>
                setValue('role', v as StaffRole, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(StaffRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {STAFF_ROLE_TH[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors?.role?.message}</FieldError>
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
              ) : staffId ? (
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
