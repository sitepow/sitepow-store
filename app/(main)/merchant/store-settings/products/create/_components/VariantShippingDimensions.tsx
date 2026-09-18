'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ProductFormValues } from '@/zod/product'

interface VariantShippingDimensionsProps {
  index: number
}

export function VariantShippingDimensions({
  index,
}: VariantShippingDimensionsProps) {
  const t = useTranslations('merchant.products.form')
  const { control } = useFormContext<ProductFormValues>()

  return (
    <div className="space-y-5 sm:col-span-12">
      <Separator />
      <div className="grid grid-cols-2 gap-4 md:col-span-12">
        <div className="col-span-2">
          <FieldLabel className="text-muted-foreground text-xs font-bold">
            {t('shippingInfo')}
          </FieldLabel>
        </div>
        <Controller
          name={`variants.${index}.weight`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-xs">{t('weight')}</FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                step="0.01"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
        <Controller
          name={`variants.${index}.width`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-xs">{t('width')}</FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                step="0.01"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
        <Controller
          name={`variants.${index}.height`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-xs">{t('height')}</FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                step="0.01"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
        <Controller
          name={`variants.${index}.length`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-xs">{t('length')}</FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                step="0.01"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
      </div>
    </div>
  )
}
