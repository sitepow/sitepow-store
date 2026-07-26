'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useCreateRole } from '@/actions/hooks/role'
import { DefaultRole } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CreateRoleFormValues, createRoleSchema } from '@/zod/role'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const DEFAULT_VALUES: CreateRoleFormValues = {
  name: DefaultRole.STAFF,
}

interface RoleDialogProps {
  onRoleCreated?: (roleId: string) => void
}

export function RoleDialog({ onRoleCreated }: RoleDialogProps) {
  const [open, setOpen] = useState(false)
  const { selectedStoreId } = useStoreFilter()
  const createRoleMutation = useCreateRole()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = (values: CreateRoleFormValues) => {
    createRoleMutation.mutate(
      {
        storeId: selectedStoreId,
        name: values.name,
      },
      {
        onSuccess: (res) => {
          if (res?.success && res.data) {
            reset(DEFAULT_VALUES)
            setOpen(false)
            if (res.data.id && onRoleCreated) {
              onRoleCreated(res.data.id)
            }
          }
        },
      },
    )
  }

  const handleClose = () => {
    reset(DEFAULT_VALUES)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus /> เพิ่มบทบาทใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มบทบาทใหม่</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <Field>
            <FieldLabel>ชื่อบทบาท</FieldLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={createRoleMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DefaultRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors?.name?.message}</FieldError>
          </Field>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createRoleMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : (
                'บันทึกบทบาท'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
