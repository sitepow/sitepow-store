'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useProductAi } from '@/actions/ai/ai/hooks'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/catalog/product'
import { IconWand } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function ProductSlugField({
  isPending,
  onAiTrigger,
}: {
  isPending: boolean
  onAiTrigger: (action: () => void) => void
}) {
  const { selectedStoreId } = useStoreFilter()
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const title = useWatch<ProductFormValues, 'title'>({ name: 'title' })
  const debouncedTitle = useDebouncedValue(title ?? '')

  const form = useFormContext<ProductFormValues>()

  useEffect(() => {
    if (debouncedTitle && !getValues('slug')) {
      setValue('slug', toSlug(debouncedTitle), { shouldValidate: true })
    }
  }, [debouncedTitle, setValue, getValues])

  const { mutate: genSlug, isPending: isGenSlug } = useProductAi(
    form,
    AiGenTask.SLUG,
    selectedStoreId,
  )

  return (
    <Field>
      <FieldLabel>URL Slug</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          placeholder="t-shirt-limited"
          {...register('slug')}
          disabled={isPending}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onAiTrigger(() => genSlug())}
          disabled={isGenSlug}
          title="สร้าง Slug จากชื่อสินค้า"
        >
          <IconWand className="size-4" />
        </Button>
      </div>
      <FieldError>{errors?.slug?.message}</FieldError>
    </Field>
  )
}
