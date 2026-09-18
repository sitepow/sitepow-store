'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { AddressSchema } from '@/zod/address'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddressTaxFieldsProps {
  form: UseFormReturn<AddressSchema>
}

export function AddressTaxFields({ form }: AddressTaxFieldsProps) {
  const t = useTranslations('customer.addresses')
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="bg-muted/30 border-primary col-span-2 grid grid-cols-12 gap-4 rounded-lg border border-dashed p-4">
      <div className="text-muted-foreground col-span-12 text-sm font-semibold">
        {t('taxInfo')}
      </div>
      <Field className="col-span-12">
        <Label>{t('taxPayerName')}</Label>
        <Input
          {...register('taxName')}
          placeholder={t('taxPayerPlaceholder')}
        />
        <FieldError>{errors.taxName?.message}</FieldError>
      </Field>
      <Field className="col-span-8">
        <Label>{t('taxId')}</Label>
        <Input
          {...register('taxId')}
          placeholder={t('taxIdPlaceholder')}
          maxLength={13}
        />
        <FieldError>{errors.taxId?.message}</FieldError>
      </Field>
      <Field className="col-span-4">
        <Label>{t('branchCode')}</Label>
        <Input
          {...register('branchCode')}
          placeholder="00000"
          maxLength={5}
        />
        <FieldError>{errors.branchCode?.message}</FieldError>
      </Field>
    </div>
  )
}
