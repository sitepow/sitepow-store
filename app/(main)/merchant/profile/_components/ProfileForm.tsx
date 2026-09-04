'use client'

import { ComponentProps, useCallback, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useProfile, useUpdateProfile } from '@/actions/hooks/profile'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { getPathR2FromUrl } from '@/utils/image'
import { formatPhoneInput, formatPromptPay } from '@/utils/slip'
import { UpdateProfileSchema } from '@/zod/profile'
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
import { Spinner } from '@/components/ui/spinner'

export function ProfileForm({ ...props }: ComponentProps<typeof Card>) {
  const t = useTranslations('merchant.profile.form')
  const { data: profile } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const uploadMutation = useR2UploadImage(`user/${profile?.id}/profile`)
  const deleteMutation = useR2DeleteImage()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty, errors },
  } = useFormContext<UpdateProfileSchema>()

  const resetForm = useCallback(() => {
    if (!profile?.name) {
      return
    }

    const [firstName, ...rest] = profile.name.split(' ')
    const values = {
      firstName,
      lastName: rest.join(' '),
      phone: profile.phone ? formatPromptPay(profile.phone) : undefined,
      image: profile.image ?? '',
    }
    reset(values, { keepDefaultValues: false })
  }, [profile, reset])

  useEffect(() => {
    resetForm()
  }, [profile, resetForm])

  async function onSubmit(values: UpdateProfileSchema) {
    let imageUrl = values.image

    const rawPhone = values.phone ? values.phone.replace(/\D/g, '') : undefined

    try {
      if (values.image instanceof File) {
        if (profile?.image) {
          const oldKey = getPathR2FromUrl(profile.image)
          await deleteMutation.mutateAsync(oldKey)
        }

        const formData = new FormData()
        formData.append('file', values.image)

        const res = await uploadMutation.mutateAsync(formData)

        if (res.success) {
          imageUrl = res.url
        }
      }

      updateProfileMutation.mutate(
        { ...values, phone: rawPhone, image: imageUrl },
        {
          onSuccess: () => {
            reset({ ...values, phone: values.phone })
            toast.success(t('success'))
          },
        },
      )
    } catch (error) {
      console.error(error)
    }
  }

  const isPending =
    updateProfileMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
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
        <Field>
          <FieldLabel>{t('email')}</FieldLabel>
          <Input type="email" value={profile?.email ?? ''} disabled />
          <FieldDescription>{t('emailDescription')}</FieldDescription>
        </Field>
        <Field className="col-span-2">
          <FieldLabel>{t('phone')}</FieldLabel>
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Input
                {...field}
                value={value ?? ''}
                placeholder="08X-XXX-XXXX"
                onChange={(e) => {
                  const formatted = formatPhoneInput(e.target.value)
                  onChange(formatted)
                }}
              />
            )}
          />
          <FieldError>{errors.phone?.message}</FieldError>
        </Field>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
        {isDirty && (
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isPending}
          >
            {t('reset')}
          </Button>
        )}

        <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
          {isPending ? (
            <Spinner className="mr-2" />
          ) : (
            <IconDeviceFloppy size={14} className="mr-2" />
          )}
          {isPending ? t('saving') : t('save')}
        </Button>
      </CardFooter>
    </Card>
  )
}
