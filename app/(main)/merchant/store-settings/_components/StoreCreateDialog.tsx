'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useCreateStore } from '@/actions/hooks/store'
import { Plan } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues, createStoreSchema } from '@/zod/store'
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

import { PlanSelector } from './PlanSelector'
// import { PointsSettingsField } from './PointsSettingsField'
import { StoreNameField } from './StoreNameField'
import { StoreSlugField } from './StoreSlugField'
import { VatSettingsField } from './VatSettingsField'

export function StoreCreateDialog() {
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
      facebookPage: '',
      address: '',
      taxId: '',
      isVatRegistered: false,
      vatRate: 7.0,
      isPointsEnabled: false,
      pointEarningRate: 100,
      pointRedeemRate: 1,
      plan: Plan.STARTER,
    },
  })

  const {
    register,
    handleSubmit,
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
            กรอกข้อมูลพื้นฐานและตั้งค่าระบบของร้านค้าเพื่อเริ่มต้นขายสินค้าออนไลน์
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="text-muted-foreground border-b pb-1 text-sm font-semibold sm:col-span-2">
              1. เลือกแพลนการใช้งานของคุณ
            </div>

            <div className="sm:col-span-2">
              <PlanSelector isPending={createStoreMutation.isPending} />
            </div>

            <div className="text-muted-foreground border-b pt-2 pb-1 text-sm font-semibold sm:col-span-2">
              2. ข้อมูลทั่วไปของร้านค้า
            </div>

            <StoreNameField isPending={createStoreMutation.isPending} />
            <StoreSlugField isPending={createStoreMutation.isPending} />

            <Field className="sm:col-span-2">
              <FieldLabel>รายละเอียดร้านค้า</FieldLabel>
              <Input
                placeholder="อธิบายสั้นๆ เกี่ยวกับร้านค้าของคุณ"
                {...register('description')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.description?.message}</FieldError>
            </Field>

            <div className="text-muted-foreground border-b pt-2 pb-1 text-sm font-semibold sm:col-span-2">
              3. ช่องทางการติดต่อ & ที่ตั้งร้าน
            </div>

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
              <FieldLabel>Line ID ร้านค้า</FieldLabel>
              <Input
                placeholder="เช่น @minimal_kids"
                {...register('lineId')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.lineId?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Facebook Page</FieldLabel>
              <Input
                placeholder="เช่น facebook.com/yourstore"
                {...register('facebookPage')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.facebookPage?.message}</FieldError>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>ที่อยู่ร้านค้า / สำนักงาน</FieldLabel>
              <Input
                placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด..."
                {...register('address')}
                disabled={createStoreMutation.isPending}
              />
              <FieldError>{errors?.address?.message}</FieldError>
            </Field>

            <VatSettingsField isPending={createStoreMutation.isPending} />
            {/* <PointsSettingsField isPending={createStoreMutation.isPending} /> */}
          </div>
        </FormProvider>

        <DialogFooter className="mt-5 flex gap-2 border-t pt-4">
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
                <Spinner /> กำลังสร้างร้านค้า...
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
