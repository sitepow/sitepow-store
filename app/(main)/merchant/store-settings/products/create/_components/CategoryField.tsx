'use client'

import { Controller, useFormContext } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCategoryOptions } from '@/actions/hooks/category'
import { useStoreFilter } from '@/stores/use-store-filter'
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
  const t = useTranslations('merchant.products.form')
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const storeId = useStoreFilter((state) => state.selectedStoreId)
  const { data: categories = [] } = useCategoryOptions({
    storeId: storeId === 'all' ? undefined : storeId,
  })

  return (
    <Field>
      <FieldLabel>{t('categoryLabel')}</FieldLabel>
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={isPending || !storeId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError>{errors?.categoryId?.message}</FieldError>
    </Field>
  )
}
