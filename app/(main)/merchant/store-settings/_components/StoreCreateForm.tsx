'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useCreateStore } from '@/actions/hooks/store'
import { Plan } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues, createStoreSchema } from '@/zod/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2, IconPlus } from '@tabler/icons-react'

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

import { PlanSelector } from './PlanSelector'
import { SlugPreview } from './SlugPreview'

export function StoreCreateForm() {
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const createStoreMutation = useCreateStore()

  const methods = useForm<CreateStoreFormValues>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      phone: '',
      lineId: '',
      taxId: '',
      plan: Plan.STARTER,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = methods

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateStoreFormValues) => {
    createStoreMutation.mutate(
      {
        ...values,
        slug: formatSlug(values.slug),
        ownerId: user?.id ?? '',
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
        <Button className="gap-2">
          <IconPlus size={16} />
          <span>สร้างร้านค้าใหม่</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>เริ่มต้นสร้างร้านค้าใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลพื้นฐานเพื่อตั้งค่า URL หน้าร้านที่เป็นเอกลักษณ์
            พร้อมเลือกแพลนเริ่มต้นใช้งานของคุณ
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="grid gap-5 space-y-5 sm:grid-cols-2">
            <Field>
              <FieldLabel>ชื่อร้านค้า</FieldLabel>
              <Input
                placeholder="เช่น เสื้อผ้าเด็กมินิมอล"
                {...register('name')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>URL หน้าร้าน (Slug)</FieldLabel>
              <div className="flex">
                <span className="bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
                  sitepow.store/
                </span>
                <Input
                  placeholder="minimal-kids"
                  className="rounded-l-none"
                  {...register('slug')}
                  disabled={createStoreMutation.isPending}
                />
              </div>
              {errors?.slug?.message ? (
                <FieldError>{errors?.slug?.message}</FieldError>
              ) : (
                <SlugPreview />
              )}
            </Field>

            <Field>
              <FieldLabel>เบอร์โทรศัพท์ร้านค้า</FieldLabel>
              <Input
                type="tel"
                placeholder="เช่น 0812345678"
                {...register('phone')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.phone?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>รายละเอียดร้านค้า</FieldLabel>
              <Input
                placeholder="อธิบายสั้นๆ เกี่ยวกับร้านค้าของคุณ"
                {...register('description')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.description?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Line ID ร้านค้า</FieldLabel>
              <Input
                placeholder="เช่น @minimal_kids"
                {...register('lineId')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.lineId?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>เลขผู้เสียภาษีร้านค้า (Tax ID)</FieldLabel>
              <Input
                placeholder="เลข 13 หลัก (ถ้ามี)"
                maxLength={13}
                {...register('taxId', {
                  onChange: (e) => {
                    setValue('taxId', e.target.value.replace(/[^0-9]/g, ''))
                  },
                })}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.taxId?.message}</FieldError>
            </Field>

            <PlanSelector isPending={createStoreMutation.isPending} />
          </div>
        </FormProvider>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createStoreMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            disabled={createStoreMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createStoreMutation.isPending ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                <span>กำลังสร้างร้านค้า...</span>
              </>
            ) : (
              'สร้างร้านค้าของคุณ'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
