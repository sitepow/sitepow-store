'use client'

import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { COUNTRY_METADATA } from '@/constants/shipping'
import { AddressType, CountryCode } from '@/generated/prisma/enums'
import { formatPhoneInput } from '@/utils/slip'
import { AddressSchema } from '@/zod/address'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface AddressBasicFieldsProps {
  form: UseFormReturn<AddressSchema>
  isThai: boolean
  country: CountryCode
  showShippingFields: boolean
}

export function AddressBasicFields({
  form,
  isThai,
  country,
  showShippingFields,
}: AddressBasicFieldsProps) {
  const t = useTranslations('customer.addresses')
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form

  return (
    <>
      <Field className="col-span-2">
        <Label>{t('addressLabel')}</Label>
        <Input
          {...register('name')}
          placeholder={t('addressLabelPlaceholder')}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field className="col-span-2">
        <Label className="mb-3 block font-bold">
          {t('addressPurpose')}
        </Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={AddressType.SHIPPING}
                  id="shipping"
                />
                <Label
                  htmlFor="shipping"
                  className="cursor-pointer font-normal"
                >
                  {t('shippingOnly')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={AddressType.TAX} id="tax" />
                <Label
                  htmlFor="tax"
                  className="cursor-pointer font-normal"
                >
                  {t('taxOnly')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={AddressType.BOTH} id="both" />
                <Label
                  htmlFor="both"
                  className="cursor-pointer font-normal"
                >
                  {t('bothShippingTax')}
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      </Field>

      <Separator className="col-span-2" />

      {showShippingFields && (
        <Field className="col-span-2">
          <Label>{t('recipientNameRequired')}</Label>
          <Input
            {...register('receiverName')}
            placeholder={t('recipientPlaceholder')}
          />
          <FieldError>{errors.receiverName?.message}</FieldError>
        </Field>
      )}

      <Field className="col-span-2">
        <Label>ประเทศ / Country *</Label>
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val as CountryCode)
                setValue('subDistrict', '')
                setValue('district', '')
                setValue('province', '')
                setValue('postalCode', '')
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกประเทศ / Select Country" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {Object.values(COUNTRY_METADATA).map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-medium">{c.nameTH}</span>
                      <span className="text-muted-foreground text-xs">
                        ({c.nameEN})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field className="col-span-2">
        <Label>{t('phoneRequired')}</Label>
        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <Input
              {...field}
              value={value ?? ''}
              placeholder={
                isThai
                  ? '08X-XXX-XXXX'
                  : `${COUNTRY_METADATA[country]?.phonePrefix ?? '+'} 123 4567`
              }
              onChange={(e) => {
                const formatted = isThai
                  ? formatPhoneInput(e.target.value)
                  : e.target.value
                onChange(formatted)
              }}
            />
          )}
        />
        <FieldError>{errors.phone?.message}</FieldError>
      </Field>

      <Field className="col-span-2">
        <Label>{t('addressLineRequired')}</Label>
        <Input
          {...register('addressLine')}
          placeholder={
            isThai
              ? t('addressLinePlaceholder')
              : 'Street Address, Apartment, Suite, etc.'
          }
        />
        <FieldError>{errors.addressLine?.message}</FieldError>
      </Field>
    </>
  )
}
