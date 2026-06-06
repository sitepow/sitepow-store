'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useBranchOptions } from '@/actions/hooks/branch'
import { useCreateStaff } from '@/actions/hooks/staff'
import { STAFF_ROLE_TH } from '@/constants/translate'
import { StaffRole } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CreateStaffFormValues, createStaffSchema } from '@/zod/staff'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

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

export function StaffCreateDialog() {
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)
  const createStaffMutation = useCreateStaff()
  const { data: branches = [] } = useBranchOptions(selectedStoreId)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: '',
      email: '',
      role: StaffRole.CASHIER,
      branchIds: [],
    },
  })

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateStaffFormValues) => {
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

  const selectedBranchIds = watch('branchIds') ?? []

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        else setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <IconPlus size={16} />
          <span>เพิ่มพนักงาน</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>ชื่อพนักงาน</FieldLabel>
            <Input
              placeholder="เช่น สมชาย ใจดี"
              {...register('name')}
              disabled={createStaffMutation.isPending}
            />
            <FieldError>{errors?.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>อีเมล</FieldLabel>
            <Input
              type="email"
              placeholder="เช่น staff@example.com"
              {...register('email')}
              disabled={createStaffMutation.isPending}
            />
            <FieldError>{errors?.email?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>บทบาท</FieldLabel>
            <Select
              value={watch('role')}
              disabled={createStaffMutation.isPending}
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
              disabled={createStaffMutation.isPending}
              placeholder="เลือกสาขา"
              allSelectedLabel="ทุกสาขา"
            />
            <FieldError>{errors?.branchIds?.message}</FieldError>
          </Field>
        </div>

        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createStaffMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            disabled={createStaffMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createStaffMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'เพิ่มพนักงาน'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
