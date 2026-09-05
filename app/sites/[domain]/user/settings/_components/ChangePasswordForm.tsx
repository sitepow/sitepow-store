'use client'

import { useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useUpdatePassword } from '@/actions/hooks/storefront/security'
import {
  ChangePasswordFormValues,
  changePasswordSchema,
} from '@/zod/storefront/change-password'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLock } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function ChangePasswordForm() {
  const t = useTranslations('customer.settings')
  const tCommon = useTranslations('common')
  const { mutate: updatePassword, isPending } = useUpdatePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: ChangePasswordFormValues) => {
    updatePassword(data, {
      onSuccess: () => reset(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconLock}
            title={t('passwordTitle')}
            description={t('passwordDesc')}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Field>
              <FieldLabel>{t('currentPassword')}</FieldLabel>
              <Input
                type="password"
                {...register('currentPassword')}
                placeholder="••••••••"
              />
              {errors.currentPassword && (
                <FieldError>{errors.currentPassword.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>{t('newPassword')}</FieldLabel>
              <Input
                type="password"
                {...register('newPassword')}
                placeholder={t('newPasswordPlaceholder')}
              />
              {errors.newPassword && (
                <FieldError>{errors.newPassword.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>{t('confirmPassword')}</FieldLabel>
              <Input
                type="password"
                {...register('confirmPassword')}
                placeholder={t('confirmPasswordPlaceholder')}
              />
              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isPending}
            >
              {t('reset')}
            </Button>
          )}

          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? tCommon('actions.saving') : t('updatePassword')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
