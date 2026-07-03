'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ProductFormValues } from '@/zod/product'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function ProductTitleField({ isPending }: { isPending: boolean }) {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const title = useWatch<ProductFormValues, 'title'>({ name: 'title' })
  const debouncedTitle = useDebouncedValue(title ?? '')

  useEffect(() => {
    if (debouncedTitle && !getValues('slug')) {
      setValue('slug', toSlug(debouncedTitle), { shouldValidate: true })
    }
  }, [debouncedTitle, setValue, getValues])

  return (
    <Field>
      <FieldLabel>ชื่อสินค้า</FieldLabel>
      <Input
        placeholder="เช่น เสื้อยืดลายพิเศษ"
        {...register('title')}
        disabled={isPending}
      />
      <FieldError>{errors?.title?.message}</FieldError>
    </Field>
  )
}
