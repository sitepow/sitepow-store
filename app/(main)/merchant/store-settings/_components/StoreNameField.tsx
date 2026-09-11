'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCheckStoreAvailability } from '@/actions/hooks/store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { CreateStoreFormValues } from '@/zod/store'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function StoreNameField({ isPending }: { isPending: boolean }) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.stores.dialog')
  const {
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateStoreFormValues>()

  const name = useWatch<CreateStoreFormValues, 'name'>({ name: 'name' })
  const debouncedName = useDebouncedValue(name ?? '')

  const { data: availability } = useCheckStoreAvailability({
    name: debouncedName || undefined,
  })

  useEffect(() => {
    if (!debouncedName) {
      return
    }

    if (!availability?.nameAvailable) {
      setError('name', { message: t('nameAlreadyTaken') })
    } else {
      clearErrors('name')
    }
  }, [availability, debouncedName, setError, clearErrors, t])

  return (
    <Field
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <FieldLabel>{t('storeNameLabel')}</FieldLabel>
      <Input
        placeholder={t('storeNamePlaceholder')}
        {...register('name')}
        disabled={isPending}
      />
      <FieldError>{errors?.name?.message}</FieldError>
    </Field>
  )
}
