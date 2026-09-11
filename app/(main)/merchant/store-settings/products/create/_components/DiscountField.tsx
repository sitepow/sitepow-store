'use client'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { DiscountType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ProductFormValues } from '@/zod/product'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export function DiscountField({ index }: { index: number }) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products.form')
  const { control } = useFormContext<ProductFormValues>()

  const discountActive = useWatch({
    control,
    name: `variants.${index}.discount.active`,
  })

  return (
    <div
      className="space-y-4"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <span className="text-sm font-medium">{t('enableDiscount')}</span>
        </div>
        <Controller
          name={`variants.${index}.discount.active`}
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <Controller
          name={`variants.${index}.discount.type`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-muted-foreground text-[10px]">
                {t('discountType')}
              </FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!discountActive}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DiscountType.PERCENTAGE}>
                    {t('discountPercentage')}
                  </SelectItem>
                  <SelectItem value={DiscountType.FIXED}>
                    {t('discountFixed')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name={`variants.${index}.discount.amount`}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-muted-foreground text-[10px]">
                {t('discountValue')}
              </FieldLabel>
              <Input
                {...field}
                type="number"
                placeholder="0"
                className="h-9"
                min="0"
                step="1"
                disabled={!discountActive}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
      </div>
    </div>
  )
}
