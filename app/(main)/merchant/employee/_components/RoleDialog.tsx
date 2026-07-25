'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateRole } from '@/actions/hooks/role'
import { PermissionRole } from '@/generated/prisma/enums'
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
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

const DEFAULT_VALUES: CreateRoleFormValues = {
  name: PermissionRole.STAFF,
  description: '',
}

interface RoleDialogProps {
  onRoleCreated?: (roleId: string) => void
}

export function RoleDialog({ onRoleCreated }: RoleDialogProps) {
  const [open, setOpen] = useState(false)
  const { selectedStoreId } = useStoreFilter()
  const createRoleMutation = useCreateRole()

  const {
    register,
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
        description: values.description,
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
            <Input
              placeholder="เช่น ผู้จัดการสาขา, แคชเชียร์"
              {...register('name')}
              disabled={createRoleMutation.isPending}
            />
            <FieldError>{errors?.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>คำอธิบาย (ถ้ามี)</FieldLabel>
            <Input
              placeholder="รายละเอียดหน้าที่ของบทบาทนี้"
              {...register('description')}
              disabled={createRoleMutation.isPending}
            />
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
