'use client'

import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ProductFormValues } from '@/zod/product'

import { DiscountField } from './DiscountField'

interface VariantDiscountPointsProps {
  index: number
}

export function VariantDiscountPoints({ index }: VariantDiscountPointsProps) {
  const t = useTranslations('merchant.products.form')
  const { control } = useFormContext<ProductFormValues>()

  const pointsActive = useWatch({
    control,
    name: `variants.${index}.rewardPoints.isActive`,
  })

  return (
    <div className="grid gap-5 border-t pt-5 sm:col-span-12 sm:grid-cols-2 xl:col-span-12">
      <DiscountField index={index} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <span className="text-sm font-medium">
              {t('rewardPointsSwitch')}
            </span>
          </div>
          <Controller
            name={`variants.${index}.rewardPoints.isActive`}
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <Controller
          name={`variants.${index}.rewardPoints.amount`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-muted-foreground text-[10px]">
                {t('rewardPointsAmount')}
              </FieldLabel>
              <Input
                {...field}
                type="number"
                placeholder={t('rewardPointsPlaceholder')}
                className="h-9"
                min="0"
                step="1"
                disabled={!pointsActive}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
      </div>
    </div>
  )
}
