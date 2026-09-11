'use client'

import React from 'react'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues } from '@/zod/store'

import { FieldDescription } from '@/components/ui/field'

export function SlugPreview() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.stores.dialog')
  const { control } = useFormContext<CreateStoreFormValues>()

  const storeSlug = useWatch({
    control,
    name: 'slug',
  })

  if (!storeSlug) {
    return null
  }

  return (
    <FieldDescription
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      {t('slugPreview')}{' '}
      <span className="text-foreground font-medium">
        https://{formatSlug(storeSlug)}.sitepow.store
      </span>
    </FieldDescription>
  )
}
