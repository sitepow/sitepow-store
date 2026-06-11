'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useBranches } from '@/actions/hooks/branch'
import { useCreateCoupon } from '@/actions/hooks/coupon'
import { DiscountType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CreateCouponFormValues, createCouponSchema } from '@/zod/coupon'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export function CouponCreateDialog() {
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)
  const createCouponMutation = useCreateCoupon()

  const { data: { data: branches = [] } = {} } = useBranches({
    storeId: selectedStoreId,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCouponFormValues>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: DiscountType.FIXED,
      discountAmount: 0,
      minOrderAmount: 0,
      maxDiscount: null,
      startDate: '',
      endDate: '',
      usageLimit: null,
      branchId: null,
    },
  })

  const discountType = watch('discountType')

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateCouponFormValues) => {
    createCouponMutation.mutate(
      { ...values, storeId: selectedStoreId },
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
        <Button>
          สร้างคูปองใหม่
          <IconPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>สร้างคูปองส่วนลดใหม่</DialogTitle>
          <DialogDescription>
            กำหนดเงื่อนไขและมูลค่าส่วนลดสำหรับคูปองโปรโมชันของร้านค้าคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>รหัสคูปอง</FieldLabel>
            <Input
              placeholder="เช่น OPENING20, SUMMER50"
              className="uppercase"
              {...register('code', {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase()
                },
              })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.code?.message}</FieldError>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>คำอธิบาย</FieldLabel>
            <Textarea
              placeholder="อธิบายเงื่อนไขหรือรายละเอียดของคูปอง"
              rows={2}
              {...register('description')}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.description?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>ประเภทส่วนลด</FieldLabel>
            <Select
              defaultValue={DiscountType.FIXED}
              onValueChange={(v) =>
                setValue('discountType', v as DiscountType, {
                  shouldValidate: true,
                })
              }
              disabled={createCouponMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DiscountType.FIXED}>
                  ลดแบบจำนวนเงิน (฿)
                </SelectItem>
                <SelectItem value={DiscountType.PERCENTAGE}>
                  ลดแบบเปอร์เซ็นต์ (%)
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{errors?.discountType?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              มูลค่าส่วนลด{' '}
              {discountType === DiscountType.PERCENTAGE ? '(%)' : '(฿)'}
            </FieldLabel>
            <Input
              type="number"
              min={0}
              max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
              placeholder={
                discountType === DiscountType.PERCENTAGE ? 'เช่น 10' : 'เช่น 50'
              }
              {...register('discountAmount', { valueAsNumber: true })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.discountAmount?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>ยอดสั่งซื้อขั้นต่ำ (฿)</FieldLabel>
            <Input
              type="number"
              min={0}
              placeholder="0 = ไม่มีขั้นต่ำ"
              {...register('minOrderAmount', { valueAsNumber: true })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.minOrderAmount?.message}</FieldError>
          </Field>

          {discountType === DiscountType.PERCENTAGE && (
            <Field>
              <FieldLabel>ส่วนลดสูงสุด (฿)</FieldLabel>
              <Input
                type="number"
                min={0}
                placeholder="เว้นว่าง = ไม่จำกัด"
                {...register('maxDiscount', { valueAsNumber: true })}
                disabled={createCouponMutation.isPending}
              />
              <FieldError>{errors?.maxDiscount?.message}</FieldError>
            </Field>
          )}

          <Field>
            <FieldLabel>วันเริ่มต้น</FieldLabel>
            <DatePicker
              value={watch('startDate')}
              onChange={(v) =>
                setValue('startDate', v, { shouldValidate: true })
              }
              placeholder="เลือกวันเริ่มต้น"
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.startDate?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>วันสิ้นสุด</FieldLabel>
            <DatePicker
              value={watch('endDate')}
              onChange={(v) => setValue('endDate', v, { shouldValidate: true })}
              placeholder="เลือกวันสิ้นสุด"
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.endDate?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>จำนวนสิทธิ์</FieldLabel>
            <Input
              type="number"
              min={1}
              placeholder="เว้นว่าง = ไม่จำกัด"
              {...register('usageLimit', { valueAsNumber: true })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.usageLimit?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>สาขาที่เข้าร่วม</FieldLabel>
            <Select
              onValueChange={(v) =>
                setValue('branchId', v === 'all' ? null : v, {
                  shouldValidate: true,
                })
              }
              disabled={createCouponMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="ทุกสาขา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสาขา</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors?.branchId?.message}</FieldError>
          </Field>
        </div>

        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createCouponMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createCouponMutation.isPending}
          >
            {createCouponMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'สร้างคูปอง'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
