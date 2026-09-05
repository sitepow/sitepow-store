'use client'

import { useFormContext } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { CreateStoreFormValues } from '@/zod/store'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface VatSettingsFieldProps {
  isPending: boolean
}

export function VatSettingsField({ isPending }: VatSettingsFieldProps) {
  const t = useTranslations('merchant.stores.dialog')
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateStoreFormValues>()

  const isVatRegistered = watch('isVatRegistered')

  return (
    <>
      <div className="text-muted-foreground border-b pt-2 pb-1 text-sm font-semibold sm:col-span-2">
        {t('step4')}
      </div>

      <Field>
        <FieldLabel>{t('taxIdLabel')}</FieldLabel>
        <Input
          placeholder={t('taxIdPlaceholder')}
          maxLength={13}
          {...register('taxId', {
            onChange: (e) => {
              setValue('taxId', e.target.value.replace(/[^0-9]/g, ''))
            },
          })}
          disabled={isPending}
        />
        <FieldError>{errors?.taxId?.message}</FieldError>
      </Field>

      <div className="flex flex-col justify-end pb-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={isVatRegistered}
            onCheckedChange={(checked) =>
              setValue('isVatRegistered', !!checked)
            }
            disabled={isPending}
          />
          <span>{t('vatRegistered')}</span>
        </label>
      </div>

      {isVatRegistered && (
        <Field className="animate-in fade-in duration-200">
          <FieldLabel>{t('vatRateLabel')}</FieldLabel>
          <Input
            type="number"
            step="0.01"
            placeholder="7.0"
            {...register('vatRate', { valueAsNumber: true })}
            disabled={isPending}
          />
          <FieldError>{errors?.vatRate?.message}</FieldError>
        </Field>
      )}
    </>
  )
}
