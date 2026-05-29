'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DiscountField({ index }: { index: number }) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const active = useWatch<ProductFormValues>({
    name: `variants.${index}.discount.active`,
  })

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={!!active}
          onCheckedChange={(v) =>
            setValue(`variants.${index}.discount.active`, !!v)
          }
        />
        <span>เปิดใช้งานส่วนลด</span>
      </label>

      {active && (
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>ประเภทส่วนลด</FieldLabel>
            <Select
              defaultValue="PERCENTAGE"
              onValueChange={(v) =>
                setValue(
                  `variants.${index}.discount.type`,
                  v as 'PERCENTAGE' | 'FIXED',
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">เปอร์เซ็นต์ (%)</SelectItem>
                <SelectItem value="FIXED">จำนวนเงิน (บาท)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>จำนวนส่วนลด</FieldLabel>
            <Input
              type="number"
              placeholder="0"
              {...register(`variants.${index}.discount.amount`, {
                valueAsNumber: true,
              })}
            />
            <FieldError>
              {errors?.variants?.[index]?.discount?.amount?.message}
            </FieldError>
          </Field>
        </div>
      )}
    </div>
  )
}
