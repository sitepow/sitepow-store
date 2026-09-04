'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCheckStoreAvailability } from '@/actions/hooks/store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues } from '@/zod/store'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { SlugPreview } from './SlugPreview'

export function StoreSlugField({ isPending }: { isPending: boolean }) {
  const t = useTranslations('merchant.stores.dialog')
  const {
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateStoreFormValues>()

  const slug = useWatch<CreateStoreFormValues, 'slug'>({ name: 'slug' })
  const debouncedSlug = useDebouncedValue(slug ? formatSlug(slug) : '')

  const { data: availability } = useCheckStoreAvailability({
    slug: debouncedSlug || undefined,
  })

  useEffect(() => {
    if (!debouncedSlug) {
      return
    }

    if (!availability?.slugAvailable) {
      setError('slug', { message: t('slugAlreadyTaken') })
    } else {
      clearErrors('slug')
    }
  }, [availability, debouncedSlug, setError, clearErrors, t])

  return (
    <Field>
      <FieldLabel>{t('storeSlugLabel')}</FieldLabel>
      <div className="flex">
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
          sitepow.store/
        </span>
        <Input
          placeholder="minimal-kids"
          className="rounded-l-none"
          {...register('slug')}
          disabled={isPending}
        />
      </div>
      {errors?.slug?.message ? (
        <FieldError>{errors?.slug?.message}</FieldError>
      ) : (
        <SlugPreview />
      )}
    </Field>
  )
}
