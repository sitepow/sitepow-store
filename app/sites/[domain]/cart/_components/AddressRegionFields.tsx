'use client'

import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { CreateInput } from '@/components/AddressAutoField'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Address } from '@/lib/address/logic'
import { AddressSchema } from '@/zod/address'

const InputThaiAddress = CreateInput()

interface AddressRegionFieldsProps {
  form: UseFormReturn<AddressSchema>
  isThai: boolean
  onAddressAutoSelect: (selectedAddr: Address) => void
}

export function AddressRegionFields({
  form,
  isThai,
  onAddressAutoSelect,
}: AddressRegionFieldsProps) {
  const t = useTranslations('customer.addresses')
  const {
    register,
    control,
    formState: { errors },
  } = form

  if (isThai) {
    return (
      <>
        <Field>
          <Label>{t('subDistrictRequired')}</Label>
          <Controller
            control={control}
            name="subDistrict"
            render={({ field }) => (
              <InputThaiAddress.District
                value={field.value ?? ''}
                onChange={field.onChange}
                onSelect={onAddressAutoSelect}
              />
            )}
          />
          <FieldError>{errors.subDistrict?.message}</FieldError>
        </Field>

        <Field>
          <Label>{t('districtRequired')}</Label>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <InputThaiAddress.Amphoe
                value={field.value ?? ''}
                onChange={field.onChange}
                onSelect={onAddressAutoSelect}
              />
            )}
          />
          <FieldError>{errors.district?.message}</FieldError>
        </Field>

        <Field>
          <Label>{t('provinceRequired')}</Label>
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <InputThaiAddress.Province
                value={field.value ?? ''}
                onChange={field.onChange}
                onSelect={onAddressAutoSelect}
              />
            )}
          />
          <FieldError>{errors.province?.message}</FieldError>
        </Field>

        <Field>
          <Label>{t('postalCodeRequired')}</Label>
          <Controller
            control={control}
            name="postalCode"
            render={({ field }) => (
              <InputThaiAddress.Zipcode
                value={field.value ?? ''}
                onChange={field.onChange}
                onSelect={onAddressAutoSelect}
              />
            )}
          />
          <FieldError>{errors.postalCode?.message}</FieldError>
        </Field>
      </>
    )
  }

  return (
    <>
      <Field className="col-span-1">
        <Label>เมือง / City *</Label>
        <Input
          {...register('district')}
          placeholder="City, District or Town"
        />
        <FieldError>{errors.district?.message}</FieldError>
      </Field>

      <Field className="col-span-1">
        <Label>รัฐ / มณฑล / State / Region *</Label>
        <Input
          {...register('province')}
          placeholder="State, Province or Region"
        />
        <FieldError>{errors.province?.message}</FieldError>
      </Field>

      <Field className="col-span-2">
        <Label>รหัสไปรษณีย์ / Postal Code / ZIP *</Label>
        <Input
          {...register('postalCode')}
          placeholder="Postal / ZIP Code (e.g. 90210, SW1A 1AA)"
        />
        <FieldError>{errors.postalCode?.message}</FieldError>
      </Field>
    </>
  )
}
