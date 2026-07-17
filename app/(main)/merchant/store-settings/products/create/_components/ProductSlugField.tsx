'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useProductAi } from '@/actions/hooks/ai'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'
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

export function ProductSlugField({ isPending }: { isPending: boolean }) {
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
          onClick={() => genSlug()}
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
