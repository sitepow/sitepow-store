'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ProductFormValues } from '@/zod/product'

interface VariantBasicFieldsProps {
  index: number
}

export function VariantBasicFields({ index }: VariantBasicFieldsProps) {
  const t = useTranslations('merchant.products.form')
  const { control } = useFormContext<ProductFormValues>()

  return (
    <div className="grid grid-cols-1 gap-4 sm:col-span-9 sm:grid-cols-12">
      <div className="sm:col-span-6 md:col-span-6">
        <Controller
          name={`variants.${index}.title`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-xs">
                {t('variantTitlePlaceholder')}
              </FieldLabel>
              <Input {...field} />
            </Field>
          )}
        />
      </div>
      <div className="sm:col-span-6 md:col-span-6">
        <Controller
          name={`variants.${index}.sku`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-xs">{t('skuLabel')}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder="SKU-12345"
              />
            </Field>
          )}
        />
      </div>
      <div className="sm:col-span-6">
        <Controller
          name={`variants.${index}.price`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">{t('priceLabel')}</FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                step="1"
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="sm:col-span-6">
        <Controller
          name={`variants.${index}.costPrice`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">{t('costLabel')}</FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  )
}
