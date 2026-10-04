import { useFormContext, useWatch } from 'react-hook-form'

import { formatSlug } from '@/utils/formatting/slug'
import { CreateStoreFormValues } from '@/zod/store/create-store'

import { FieldDescription } from '@/components/ui/field'

export function SlugPreview() {
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
      <span className="text-foreground font-medium">
        https://{formatSlug(storeSlug)}.sitepow.store
      </span>
    </FieldDescription>
  )
}
