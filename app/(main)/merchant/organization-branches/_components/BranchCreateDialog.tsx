'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateBranch } from '@/actions/hooks/branch'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CreateBranchFormValues, createBranchSchema } from '@/zod/branch'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function BranchCreateDialog() {
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)
  const createBranchMutation = useCreateBranch()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: '',
    },
  })

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateBranchFormValues) => {
    createBranchMutation.mutate(
      {
        ...values,
        storeId: selectedStoreId,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose()
        } else {
          setOpen(v)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconPlus />
          เพิ่มสาขาใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มสาขาใหม่</DialogTitle>
          <DialogDescription>
            กรอกชื่อสาขาที่ต้องการเพิ่มเข้าในร้านค้าของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>ชื่อสาขา</FieldLabel>
            <Input
              placeholder="เช่น สาขาสยาม, สาขาอโศก"
              {...register('name')}
              disabled={createBranchMutation.isPending}
            />
            <FieldError>{errors?.name?.message}</FieldError>
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createBranchMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'บันทึกสาขา'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
