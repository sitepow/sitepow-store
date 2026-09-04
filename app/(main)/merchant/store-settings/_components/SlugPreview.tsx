import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues } from '@/zod/store'

import { FieldDescription } from '@/components/ui/field'

export function SlugPreview() {
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
    <FieldDescription>
      ลิงก์ร้านค้าของคุณ{' '}
      {t('slugPreview')}{' '}
      <span className="text-foreground font-medium">
        https://{formatSlug(storeSlug)}.sitepow.store
      </span>
    </FieldDescription>
  )
}
