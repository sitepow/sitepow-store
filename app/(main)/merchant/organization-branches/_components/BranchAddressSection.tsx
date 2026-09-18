'use client'

import React from 'react'
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { CreateInput } from '@/components/AddressAutoField'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Address } from '@/lib/address/logic'
import { CreateBranchFormValues } from '@/zod/branch'

const InputThaiAddress = CreateInput()

interface BranchAddressSectionProps {
  register: UseFormRegister<CreateBranchFormValues>
  control: Control<CreateBranchFormValues>
  errors: FieldErrors<CreateBranchFormValues>
  onAddressAutoSelect: (selectedAddr: Address) => void
}

export function BranchAddressSection({
  register,
  control,
  errors,
  onAddressAutoSelect,
}: BranchAddressSectionProps) {
  const t = useTranslations('merchant.branches')

  return (
    <>
      <Field>
        <FieldLabel>{t('dialog.nameLabel')}</FieldLabel>
        <Input
          placeholder={t('dialog.namePlaceholder')}
          disabled
          {...register('name')}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel>{t('dialog.addressLabel')}</FieldLabel>
        <Input
          placeholder={t('dialog.addressPlaceholder')}
          {...register('address')}
        />
        <FieldError>{errors.address?.message}</FieldError>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>{t('dialog.subDistrictLabel')}</FieldLabel>
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
          <FieldLabel>{t('dialog.districtLabel')}</FieldLabel>
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
          <FieldLabel>{t('dialog.provinceLabel')}</FieldLabel>
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
          <FieldLabel>{t('dialog.postcodeLabel')}</FieldLabel>
          <Controller
            control={control}
            name="postcode"
            render={({ field }) => (
              <InputThaiAddress.Zipcode
                value={field.value ?? ''}
                onChange={field.onChange}
                onSelect={onAddressAutoSelect}
              />
            )}
          />
          <FieldError>{errors.postcode?.message}</FieldError>
        </Field>
      </div>
    </>
  )
}
