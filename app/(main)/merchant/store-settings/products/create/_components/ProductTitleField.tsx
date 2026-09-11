'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useProductAi } from '@/actions/hooks/ai'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useStoreFilter } from '@/stores/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'
import { IconWand } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function ProductTitleField({
  isPending,
  onAiTrigger,
}: {
  isPending: boolean
  onAiTrigger: (action: () => void) => void
}) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products.form')
  const { selectedStoreId } = useStoreFilter()
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const form = useFormContext<ProductFormValues>()

  const title = useWatch<ProductFormValues, 'title'>({ name: 'title' })
  const debouncedTitle = useDebouncedValue(title ?? '')

  useEffect(() => {
    if (debouncedTitle && !getValues('slug')) {
      setValue('slug', toSlug(debouncedTitle), { shouldValidate: true })
    }
  }, [debouncedTitle, setValue, getValues])

  const { mutate: genTitle, isPending: isGenTitle } = useProductAi(
    form,
    AiGenTask.TITLE,
    selectedStoreId,
  )

  return (
    <Field
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <FieldLabel>{t('title')}</FieldLabel>
      <div className="flex items-center gap-2">
        <Textarea
          placeholder={t('titlePlaceholder')}
          {...register('title')}
          disabled={isPending}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onAiTrigger(() => genTitle())}
          disabled={isGenTitle}
          title={t('generateTitleTooltip')}
        >
          <IconWand className="size-4" />
        </Button>
      </div>
      <FieldError>{errors?.title?.message}</FieldError>
    </Field>
  )
}
