'use client'

import React from 'react'
import { Control, Controller, FieldArrayWithId, UseFormRegister, UseFormWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { CreateBranchFormValues } from '@/zod/branch'

interface BranchOpeningHoursSectionProps {
  fields: FieldArrayWithId<CreateBranchFormValues, 'openingHours', 'id'>[]
  register: UseFormRegister<CreateBranchFormValues>
  control: Control<CreateBranchFormValues>
  watch: UseFormWatch<CreateBranchFormValues>
}

export function BranchOpeningHoursSection({
  fields,
  register,
  control,
  watch,
}: BranchOpeningHoursSectionProps) {
  const t = useTranslations('merchant.branches')

  if (!fields.length) return null

  return (
    <div className="space-y-3">
      <FieldLabel>{t('dialog.openingHoursLabel')}</FieldLabel>
      {fields.map((field, index) => {
        const isOpen = watch(`openingHours.${index}.isOpen`)

        return (
          <div
            key={field.id}
            className="border-border/50 grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-[80px_1fr_1fr_120px] sm:items-center sm:border-none sm:p-0"
          >
            <span className="col-span-2 text-sm font-semibold sm:col-span-1 sm:font-medium">
              {t.has(`dialog.days.${field.day}` as Parameters<typeof t>[0])
                ? t(`dialog.days.${field.day}` as Parameters<typeof t>[0])
                : field.day}
            </span>
            <Input
              {...register(`openingHours.${index}.open`)}
              type="time"
              className="h-9"
              disabled={!isOpen}
            />
            <Input
              {...register(`openingHours.${index}.close`)}
              type="time"
              className="h-9"
              disabled={!isOpen}
            />
            <div className="flex w-fit flex-col items-center gap-2">
              <span className="text-muted-foreground text-xs">
                {isOpen
                  ? t('dialog.openStatus')
                  : t('dialog.closedStatus')}
              </span>
              <Controller
                control={control}
                name={`openingHours.${index}.isOpen`}
                render={({ field: subField }) => (
                  <Switch
                    checked={subField.value}
                    onCheckedChange={subField.onChange}
                  />
                )}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
