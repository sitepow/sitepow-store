/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { formatCurrency } from '@/utils/pricing'
import { IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface EditCustomPriceFormValues {
  customPrice: number
  discountPercent: number
}

interface EditCustomPriceDialogProps {
  open: boolean
  setOpen: (v: boolean) => void
  stock: any
  isLoading?: boolean
  onSave?: (variantId: string, customPrice: number) => void
}

export function EditCustomPriceDialog({
  open,
  setOpen,
  stock,
  isLoading = false,
  onSave,
}: EditCustomPriceDialogProps) {
  const methods = useForm<EditCustomPriceFormValues>({
    defaultValues: {
      customPrice: 0,
      discountPercent: 0,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods

  const retailPrice = Number(stock?.variant?.price || 0)
  const inputCustomPrice = watch('customPrice') || 0
  const inputDiscountPercent = watch('discountPercent') || 0

  const discountAmount = retailPrice - inputCustomPrice

  useEffect(() => {
    if (open && stock) {
      const initialCustomPrice = stock?.customPrice
        ? Number(stock.customPrice)
        : retailPrice
      const initialPercent =
        retailPrice > 0
          ? Number(
              (
                ((retailPrice - initialCustomPrice) / retailPrice) *
                100
              ).toFixed(2),
            )
          : 0

      reset({
        customPrice: initialCustomPrice,
        discountPercent: initialPercent,
      })
    }
  }, [open, stock, retailPrice, reset])

  const handlePercentChange = (percent: number) => {
    setValue('discountPercent', percent, {
      shouldDirty: true,
      shouldValidate: true,
    })
    if (retailPrice > 0) {
      const calculatedCustomPrice = Number(
        (retailPrice * (1 - percent / 100)).toFixed(2),
      )
      setValue('customPrice', calculatedCustomPrice, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  const handleCustomPriceChange = (price: number) => {
    setValue('customPrice', price, { shouldDirty: true, shouldValidate: true })
    if (retailPrice > 0) {
      const calculatedPercent = Number(
        (((retailPrice - price) / retailPrice) * 100).toFixed(2),
      )
      setValue('discountPercent', calculatedPercent, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit: SubmitHandler<EditCustomPriceFormValues> = (values) => {
    onSave?.(stock?.variantId, Number(values.customPrice))
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent className="sm:max-w-106.25">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>ตั้งราคาส่งเฉพาะรายการ</DialogTitle>
              <DialogDescription>
                กำหนดราคาต้นทุนส่งฝากขายเฉพาะสินค้านี้สำหรับสัญญาตัวแทน
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {stock?.variant?.product?.title || '-'}
                </p>
                <p className="text-muted-foreground text-xs">
                  ตัวเลือก: {stock?.variant?.title || '-'}
                </p>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ราคาขายปลีกปกติ:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(retailPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ส่วนลดตัวแทนที่จะได้รับ:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Math.max(0, discountAmount))} (
                    {inputDiscountPercent}%)
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t pt-1">
                  <span className="font-medium">ทุนโอนเคลียร์ร้านค้า:</span>
                  <span className="font-medium">
                    {formatCurrency(inputCustomPrice)}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="discountPercent">ส่วนลด (%)</FieldLabel>
                  <Input
                    id="discountPercent"
                    type="number"
                    step="0.1"
                    placeholder="เช่น 25"
                    {...register('discountPercent', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'ต้องไม่ติดลบ' },
                      max: { value: 100, message: 'ไม่เกิน 100%' },
                      onChange: (e) =>
                        handlePercentChange(Number(e.target.value)),
                    })}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.discountPercent?.message}</FieldError>
                </Field>
                <Field className="space-y-2">
                  <FieldLabel htmlFor="customPrice">
                    ราคาส่งฝากขาย (บาท/ชิ้น)
                  </FieldLabel>
                  <Input
                    id="customPrice"
                    type="number"
                    step="0.01"
                    placeholder="ระบุราคาส่ง"
                    {...register('customPrice', {
                      valueAsNumber: true,
                      required: 'กรุณากรอกราคาส่ง',
                      min: { value: 0, message: 'ราคาส่งต้องไม่ติดลบ' },
                      onChange: (e) =>
                        handleCustomPriceChange(Number(e.target.value)),
                    })}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.customPrice?.message}</FieldError>
                </Field>
              </div>
            </div>
            <DialogFooter className="gap-2">
              {isDirty ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isLoading}
                >
                  <IconX className="size-4" />
                  ล้างข้อมูล
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  ยกเลิก
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner /> กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกราคาส่ง'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
