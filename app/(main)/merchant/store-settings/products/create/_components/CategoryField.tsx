'use client'

import { Controller, useFormContext } from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CategoryField({ isPending }: { isPending: boolean }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  return (
    <Field>
      <FieldLabel>หมวดหมู่</FieldLabel>
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="019d8c50-5e3a-7df1-8de0-e260f4f4f8dd">
                Fashion & Apparel
              </SelectItem>
              <SelectItem value="it-gadgets">IT & Gadgets</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <FieldError>{errors?.categoryId?.message}</FieldError>
    </Field>
  )
}
