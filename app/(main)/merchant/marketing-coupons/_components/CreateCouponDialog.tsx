'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

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
  const t = useTranslations('merchant.marketing')
  const tDialog = useTranslations('merchant.marketing.dialog')
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
          <IconPlus />
          {t('createCoupon')}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-x-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tDialog('title')}</DialogTitle>
          <DialogDescription>{tDialog('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>{tDialog('codeLabel')}</FieldLabel>
            <Input
              placeholder={tDialog('codePlaceholder')}
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
            <FieldLabel>{tDialog('descriptionLabel')}</FieldLabel>
            <Textarea
              placeholder={tDialog('descriptionPlaceholder')}
              rows={2}
              {...register('description')}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.description?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{tDialog('discountTypeLabel')}</FieldLabel>
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
                  {tDialog('discountTypeFixed')}
                </SelectItem>
                <SelectItem value={DiscountType.PERCENTAGE}>
                  {tDialog('discountTypePercentage')}
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{errors?.discountType?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>
              {tDialog('discountAmountLabel', {
                unit: discountType === DiscountType.PERCENTAGE ? '(%)' : '(฿)',
              })}
            </FieldLabel>
            <Input
              type="number"
              min={0}
              max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
              placeholder={
                discountType === DiscountType.PERCENTAGE
                  ? tDialog('discountAmountPlaceholderPercent')
                  : tDialog('discountAmountPlaceholderFixed')
              }
              {...register('discountAmount', { valueAsNumber: true })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.discountAmount?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{tDialog('minOrderAmountLabel')}</FieldLabel>
            <Input
              type="number"
              min={0}
              placeholder={tDialog('minOrderAmountPlaceholder')}
              {...register('minOrderAmount', { valueAsNumber: true })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.minOrderAmount?.message}</FieldError>
          </Field>
          {discountType === DiscountType.PERCENTAGE && (
            <Field>
              <FieldLabel>{tDialog('maxDiscountLabel')}</FieldLabel>
              <Input
                type="number"
                min={0}
                placeholder={tDialog('unlimitedPlaceholder')}
                {...register('maxDiscount', { valueAsNumber: true })}
                disabled={createCouponMutation.isPending}
              />
              <FieldError>{errors?.maxDiscount?.message}</FieldError>
            </Field>
          )}
          <Field>
            <FieldLabel>{tDialog('startDateLabel')}</FieldLabel>
            <DatePicker
              value={watch('startDate')}
              onChange={(v) =>
                setValue('startDate', v, { shouldValidate: true })
              }
              placeholder={tDialog('startDatePlaceholder')}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.startDate?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{tDialog('endDateLabel')}</FieldLabel>
            <DatePicker
              value={watch('endDate')}
              onChange={(v) => setValue('endDate', v, { shouldValidate: true })}
              placeholder={tDialog('endDatePlaceholder')}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.endDate?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{tDialog('usageLimitLabel')}</FieldLabel>
            <Input
              type="number"
              min={1}
              placeholder={tDialog('unlimitedPlaceholder')}
              {...register('usageLimit', { valueAsNumber: true })}
              disabled={createCouponMutation.isPending}
            />
            <FieldError>{errors?.usageLimit?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{tDialog('branchLabel')}</FieldLabel>
            <Select
              onValueChange={(v) =>
                setValue('branchId', v === 'all' ? null : v, {
                  shouldValidate: true,
                })
              }
              disabled={createCouponMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={tDialog('allBranches')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tDialog('allBranches')}</SelectItem>
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
            {tDialog('cancel')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createCouponMutation.isPending}
          >
            {createCouponMutation.isPending ? (
              <>
                <Spinner /> {tDialog('saving')}
              </>
            ) : (
              tDialog('createSubmit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
