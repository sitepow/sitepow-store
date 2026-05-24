'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateStore } from '@/actions/hooks/store'
import { Plan } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { formatNumber } from '@/utils/pricing'
import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues, createStoreSchema } from '@/zod/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2, IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

import { PLAN_DETAILS } from '../../../../../config/planDetails'

export function StoreCreateForm() {
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const createStoreMutation = useCreateStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStoreFormValues>({
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

  const storeName = watch('name')
  const storeSlug = watch('slug')
  const selectedPlan = watch('plan')

  useEffect(() => {
    if (storeName && !storeSlug) {
      setValue('slug', formatSlug(storeName))
    }
  }, [storeName, setValue, storeSlug])

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
        if (!v) handleClose()
        else setOpen(v)
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

        <form
          id="store-create-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-5 space-y-5 sm:grid-cols-2"
        >
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
              storeSlug && (
                <FieldDescription>
                  ลิงก์ร้านค้าของคุณ{' '}
                  <span className="text-foreground font-medium">
                    https://{formatSlug(storeSlug)}.sitepow.store
                  </span>
                </FieldDescription>
              )
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

          <Field className="space-y-3 sm:col-span-2">
            <FieldLabel>เลือกแพ็กเกจเริ่มต้นใช้งาน</FieldLabel>
            <div className="flex flex-col gap-3">
              {(Object.keys(PLAN_DETAILS) as Plan[]).map((key) => {
                const plan = PLAN_DETAILS[key]
                const isSelected = selectedPlan === key

                return (
                  <Card
                    key={key}
                    onClick={() =>
                      !createStoreMutation.isPending &&
                      setValue('plan', key, { shouldValidate: true })
                    }
                    className={cn(
                      'hover:border-muted-foreground/50 cursor-pointer transition-all',
                      isSelected && 'border-primary ring-primary ring-1',
                      createStoreMutation.isPending &&
                        'cursor-not-allowed opacity-60',
                    )}
                  >
                    <CardHeader className="border-b p-4">
                      <div className="flex flex-wrap items-center justify-between gap-5">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {plan.name}
                          </CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        <div className="shrink-0 text-right">
                          <b className="text-primary text-xl">
                            {formatNumber(plan.price)} -.
                          </b>
                          <span className="text-muted-foreground block text-[10px]">
                            /เดือน
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {plan.features.map((feat, i) => (
                          <li
                            key={i}
                            className="text-muted-foreground flex items-center gap-1.5 text-sm"
                          >
                            <span className="text-primary shrink-0">-</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <FieldError>{errors?.plan?.message}</FieldError>
          </Field>
        </form>
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createStoreMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            form="store-create-form"
            disabled={createStoreMutation.isPending}
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
