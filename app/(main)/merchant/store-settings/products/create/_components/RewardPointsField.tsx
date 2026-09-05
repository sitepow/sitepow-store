'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { ProductFormValues } from '@/zod/product'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function RewardPointsField({ index }: { index: number }) {
  const t = useTranslations('merchant.products.form')
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const isActive = useWatch<ProductFormValues>({
    name: `variants.${index}.rewardPoints.isActive`,
  })

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={!!isActive}
          onCheckedChange={(v) =>
            setValue(`variants.${index}.rewardPoints.isActive`, !!v)
          }
        />
        <span>{t('giveRewardPoints')}</span>
      </label>

      {isActive && (
        <Field>
          <FieldLabel>{t('rewardPointsEarned')}</FieldLabel>
          <Input
            type="number"
            placeholder="0"
            {...register(`variants.${index}.rewardPoints.amount`, {
              valueAsNumber: true,
            })}
          />
          <FieldError>
            {errors?.variants?.[index]?.rewardPoints?.amount?.message}
          </FieldError>
        </Field>
      )}
    </div>
  )
}
