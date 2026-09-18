'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Controller, UseFormReturn } from 'react-hook-form'
import { IconCoins } from '@tabler/icons-react'

import { ALL_CURRENCIES } from '@/constants/currencies'
import { PRIMARY_COLOR_OPTIONS } from '@/constants/system'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { StoreProfileFormValues } from '@/zod/store-profile'

interface StoreBasicInfoSectionProps {
  form: UseFormReturn<StoreProfileFormValues>
  isPending: boolean
}

export function StoreBasicInfoSection({
  form,
  isPending,
}: StoreBasicInfoSectionProps) {
  const t = useTranslations('merchant.settings.storeProfile')
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <>
      <Field>
        <FieldLabel>{t('primaryColor')}</FieldLabel>
        <Controller
          control={control}
          name="primaryColor"
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={field.onChange}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('primaryColorPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_COLOR_OPTIONS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription>{t('primaryColorHint')}</FieldDescription>
      </Field>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel>{t('name')}</FieldLabel>
          <Input
            placeholder={t('namePlaceholder')}
            {...register('name')}
            disabled={isPending}
          />
          <FieldError>{errors?.name?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>{t('slug')}</FieldLabel>
          <div className="flex items-center overflow-hidden rounded-md">
            <span className="border-input bg-muted text-muted-foreground flex h-9 items-center border border-r-0 px-3 text-sm select-none">
              sitepow.store/
            </span>
            <Input
              className="rounded-l-none"
              {...register('slug')}
              disabled
            />
          </div>
          <FieldError>{errors?.slug?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>{t('email')}</FieldLabel>
          <Input
            type="email"
            placeholder="example@store.com"
            {...register('email')}
            disabled={isPending}
          />
          <FieldError>{errors?.email?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>{t('taxId')}</FieldLabel>
          <Input
            maxLength={13}
            placeholder={t('taxIdPlaceholder')}
            {...register('taxId')}
            disabled={isPending}
          />
          <FieldError>{errors?.taxId?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>{t('storeDesc')}</FieldLabel>
          <Textarea
            placeholder={t('storeDescPlaceholder')}
            {...register('description')}
            disabled={isPending}
          />
          <FieldError>{errors?.description?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel className="flex items-center gap-2">
            <IconCoins size={16} className="text-primary" />
            <span>สกุลเงินหลักของร้าน (Base Currency)</span>
          </FieldLabel>
          <Controller
            control={control}
            name="baseCurrency"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกสกุลเงินหลัก" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {ALL_CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <span className="mr-2">{curr.flag}</span>
                      <span className="font-medium">{curr.code}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({curr.symbol} - {curr.name})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>
            ราคาสินค้า บริการ
            และรายงานทางการเงินของร้านค้าจะอ้างอิงตามสกุลเงินหลักนี้เป็นหลัก
          </FieldDescription>
          <FieldError>{errors?.baseCurrency?.message}</FieldError>
        </Field>
      </div>
    </>
  )
}

