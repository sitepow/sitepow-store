/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { formatCurrency } from '@/utils/pricing'
import { IconCurrencyDollar, IconX } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
  defaultCommissionRate?: number
  isLoading?: boolean
  onSave?: (variantId: string, customPrice: number) => void
}

export function EditCustomPriceDialog({
  open,
  setOpen,
  stock,
  defaultCommissionRate = 0,
  isLoading = false,
  onSave,
}: EditCustomPriceDialogProps) {
  const t = useTranslations('merchant.reseller.customPrice')
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
      let initialCustomPrice: number
      let initialPercent: number

      if (stock?.customPrice !== undefined && stock?.customPrice !== null) {
        initialCustomPrice = Number(stock.customPrice)
        initialPercent =
          retailPrice > 0
            ? Number(
                (
                  ((retailPrice - initialCustomPrice) / retailPrice) *
                  100
                ).toFixed(2),
              )
            : 0
      } else {
        initialPercent = Number(defaultCommissionRate || 0)
        initialCustomPrice =
          retailPrice > 0
            ? Number((retailPrice * (1 - initialPercent / 100)).toFixed(2))
            : 0
      }

      reset({
        customPrice: initialCustomPrice,
        discountPercent: initialPercent,
      })
    }
  }, [open, stock, retailPrice, defaultCommissionRate, reset])

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
              <DialogHeaderIcon
                icon={IconCurrencyDollar}
                title={t('title')}
                description={t('description')}
              />
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm leading-relaxed font-medium break-all whitespace-pre-line">
                  {stock?.variant?.product?.title || '-'}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed break-all whitespace-pre-line">
                  {t('variantPrefix', {
                    variant: stock?.variant?.title || '-',
                  })}
                </p>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('normalRetail')}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(retailPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('resellerDiscount')}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Math.max(0, discountAmount))} (
                    {inputDiscountPercent}%)
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t pt-1">
                  <span className="font-medium">{t('costToClear')}</span>
                  <span className="font-medium">
                    {formatCurrency(inputCustomPrice)}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="discountPercent">
                    {t('discountLabel')}
                  </FieldLabel>
                  <Input
                    id="discountPercent"
                    type="number"
                    step="0.1"
                    placeholder={t('discountPlaceholder')}
                    {...register('discountPercent', {
                      valueAsNumber: true,
                      min: { value: 0, message: t('discountMin') },
                      max: { value: 100, message: t('discountMax') },
                      onChange: (e) =>
                        handlePercentChange(Number(e.target.value)),
                    })}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.discountPercent?.message}</FieldError>
                </Field>
                <Field className="space-y-2">
                  <FieldLabel htmlFor="customPrice">
                    {t('priceLabel')}
                  </FieldLabel>
                  <Input
                    id="customPrice"
                    type="number"
                    step="0.01"
                    placeholder={t('pricePlaceholder')}
                    {...register('customPrice', {
                      valueAsNumber: true,
                      required: t('priceRequired'),
                      min: { value: 0, message: t('priceMin') },
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
                  {t('reset')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  {t('cancel')}
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner /> {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
