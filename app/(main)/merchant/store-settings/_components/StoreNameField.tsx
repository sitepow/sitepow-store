'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useCheckStoreAvailability } from '@/actions/hooks/store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { CreateStoreFormValues } from '@/zod/store'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function StoreNameField({ isPending }: { isPending: boolean }) {
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

    if (availability?.nameAvailable === false) {
      setError('name', { message: 'ชื่อร้านค้านี้ถูกใช้งานไปแล้ว' })
    } else {
      clearErrors('name')
    }
  }, [availability, debouncedName, setError, clearErrors])

  return (
    <Field>
      <FieldLabel>ชื่อร้านค้า</FieldLabel>
      <Input
        placeholder="เช่น เสื้อผ้าเด็กมินิมอล"
        {...register('name')}
        disabled={isPending}
      />
      <FieldError>{errors?.name?.message}</FieldError>
    </Field>
  )
}
