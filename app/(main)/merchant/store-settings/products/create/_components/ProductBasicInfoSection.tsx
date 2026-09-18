'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PRODUCT_TYPE_OPTIONS } from '@/constants/translate'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'

import { CategoryField } from './CategoryField'
import { ProductSlugField } from './ProductSlugField'
import { ProductTitleField } from './ProductTitleField'

interface ProductBasicInfoSectionProps {
  isPending: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
}

export function ProductBasicInfoSection({
  isPending,
  onAiTrigger,
}: ProductBasicInfoSectionProps) {
  const t = useTranslations('merchant.products.form')
  const { control, register } = useFormContext<ProductFormValues>()

  return (
    <div className="space-y-6">
      <FieldSet disabled={isPending}>
        <FieldGroup className="mt-4 grid gap-6">
          <ProductTitleField
            isPending={isPending}
            onAiTrigger={(action) => onAiTrigger(AiGenTask.TITLE, action)}
          />

          <div className="bg-muted/20 space-y-2 rounded-lg border p-3.5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
              <span>🌐 คำแปลภาษาอังกฤษ (English Translation)</span>
            </div>
            <Field>
              <FieldLabel className="text-xs">Product Title (EN)</FieldLabel>
              <Input
                placeholder="Product title in English..."
                {...register('translations.en.title')}
                disabled={isPending}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProductSlugField
              isPending={isPending}
              onAiTrigger={(action) => onAiTrigger(AiGenTask.SLUG, action)}
            />
            <CategoryField isPending={isPending} />
          </div>

          <Controller
            control={control}
            name="isPublished"
            render={({ field }) => (
              <Field className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FieldLabel className="text-base font-semibold">
                    {t('displayStorefront')}
                  </FieldLabel>
                  <p className="text-muted-foreground text-xs">
                    {t('displayStorefrontDesc')}
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <Field>
        <FieldLabel>{t('productType')}</FieldLabel>
        <Controller
          control={control}
          name="productType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectProductType')} />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(`productTypes.${type.value}` as Parameters<typeof t>[0])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
    </div>
  )
}
