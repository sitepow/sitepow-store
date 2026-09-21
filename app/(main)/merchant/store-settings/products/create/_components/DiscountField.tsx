'use client'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { DiscountType } from '@/generated/prisma/enums'
import { ProductFormValues } from '@/zod/product'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export function DiscountField({ index }: { index: number }) {
  const { control } = useFormContext<ProductFormValues>()

  const discountActive = useWatch({
    control,
    name: `variants.${index}.discount.active`,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <span className="text-sm font-medium">เปิดใช้งานส่วนลด</span>
        </div>
        <Controller
          name={`variants.${index}.discount.active`}
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <Controller
          name={`variants.${index}.discount.type`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-muted-foreground text-[10px]">
                ประเภท
              </FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!discountActive}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DiscountType.PERCENTAGE}>
                    เปอร์เซ็นต์
                  </SelectItem>
                  <SelectItem value={DiscountType.FIXED}>จำนวนเงิน</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name={`variants.${index}.discount.amount`}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-muted-foreground text-[10px]">
                มูลค่าส่วนลด
              </FieldLabel>
              <Input
                {...field}
                type="number"
                placeholder="0"
                className="h-9"
                min="0"
                step="1"
                disabled={!discountActive}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
      </div>
    </div>
  )
}
