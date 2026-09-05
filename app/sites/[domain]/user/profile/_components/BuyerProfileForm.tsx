'use client'

import { ComponentProps, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useProfile, useUpdateProfile } from '@/actions/hooks/profile'
import { formatPromptPay } from '@/utils/slip'
import { UpdateProfileSchema, updateProfileSchema } from '@/zod/profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function BuyerProfileForm({ ...props }: ComponentProps<typeof Card>) {
  const t = useTranslations('customer.profile')
  const { data: profile } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty, errors },
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  })

  const resetForm = useCallback(() => {
    if (!profile?.name) {
      return
    }

    const [firstName, ...rest] = profile.name.split(' ')
    const values = {
      firstName,
      lastName: rest.join(' '),
      phone: profile.phone ?? undefined,
    }
    reset(values, { keepDefaultValues: false })
  }, [profile, reset])

  useEffect(() => {
    resetForm()
  }, [profile, reset, resetForm])

  function onSubmit(values: UpdateProfileSchema) {
    updateProfile(values)
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{t('editPersonal')}</CardTitle>
        <CardDescription>{t('editPersonalDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t('firstName')}</FieldLabel>
          <Input {...register('firstName')} />
          <FieldError>{errors.firstName?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>{t('lastName')}</FieldLabel>
          <Input {...register('lastName')} />
          <FieldError>{errors.lastName?.message}</FieldError>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>{t('email')}</FieldLabel>
          <Input value={profile?.email ?? ''} disabled />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>{t('phone')}</FieldLabel>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                value={formatPromptPay(field.value)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '')
                  field.onChange(rawValue)
                }}
                placeholder={t('phonePlaceholder')}
                inputMode="numeric"
              />
            )}
          />
          <FieldError>{errors.phone?.message}</FieldError>
          <FieldDescription>{t('phoneDesc')}</FieldDescription>
        </Field>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
        {isDirty && (
          <Button type="button" variant="outline" onClick={resetForm}>
            {t('reset')}
          </Button>
        )}

        <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
          <IconDeviceFloppy size={14} />
          {isPending ? t('saving') : t('saveChanges')}
        </Button>
      </CardFooter>
    </Card>
  )
}
