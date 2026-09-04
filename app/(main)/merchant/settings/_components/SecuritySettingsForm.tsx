'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import {
  useSecuritySettings,
  useUpdateSecuritySettings,
  useUpdateTwoFactor,
} from '@/actions/hooks/security-settings'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  ChangePasswordFormValues,
  TwoFactorFormValues,
  changePasswordSchema,
  twoFactorSchema,
} from '@/zod/security-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLock, IconShield } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

export function SecuritySettingsForm() {
  const t = useTranslations('merchant.settings.security')
  const { user } = useSession()
  const { selectedStoreId } = useStoreFilter()
  const { data: securitySettings } = useSecuritySettings(user?.id ?? '')
  const passwordMutation = useUpdateSecuritySettings()
  const twoFactorMutation = useUpdateTwoFactor()

  const {
    register,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isDirty: isPasswordDirty, errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const {
    setValue: setTwoFactorValue,
    watch: watchTwoFactor,
    reset: resetTwoFactor,
    handleSubmit: handleTwoFactorSubmit,
    formState: { isDirty: isTwoFactorDirty },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      isTwoFactorEnabled: false,
    },
  })

  useEffect(() => {
    if (securitySettings) {
      resetTwoFactor({
        isTwoFactorEnabled: securitySettings.isTwoFactorEnabled,
      })
    }
  }, [securitySettings, resetTwoFactor])

  const onSubmitPassword = (values: ChangePasswordFormValues) => {
    passwordMutation.mutate(
      { userId: user?.id ?? '', input: values },
      {
        onSuccess: () =>
          resetPassword({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }),
      },
    )
  }

  const onSubmitTwoFactor = (values: TwoFactorFormValues) => {
    twoFactorMutation.mutate(
      { userId: user?.id ?? '', isTwoFactorEnabled: values.isTwoFactorEnabled },
      {
        onSuccess: () =>
          resetTwoFactor({ isTwoFactorEnabled: values.isTwoFactorEnabled }),
      },
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconLock}
            title={t('passwordTitle')}
            description={t('passwordDesc')}
          />
        </CardHeader>

        {selectedStoreId !== ALL_STORES && (
          <>
            <CardContent className="space-y-5">
              <Field>
                <FieldLabel>{t('currentPassword')}</FieldLabel>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  {...register('currentPassword')}
                  disabled={passwordMutation.isPending}
                />
                <FieldError>
                  {passwordErrors?.currentPassword?.message}
                </FieldError>
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel>{t('newPassword')}</FieldLabel>
                  <Input
                    type="password"
                    placeholder={t('newPasswordPlaceholder')}
                    {...register('newPassword')}
                    disabled={passwordMutation.isPending}
                  />
                  <FieldError>
                    {passwordErrors?.newPassword?.message}
                  </FieldError>
                </Field>
                <Field>
                  <FieldLabel>{t('confirmPassword')}</FieldLabel>
                  <Input
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    {...register('confirmPassword')}
                    disabled={passwordMutation.isPending}
                  />
                  <FieldError>
                    {passwordErrors?.confirmPassword?.message}
                  </FieldError>
                </Field>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
              {isPasswordDirty && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resetPassword()}
                  disabled={passwordMutation.isPending}
                >
                  {t('reset')}
                </Button>
              )}

              <Button
                size="sm"
                disabled={passwordMutation.isPending}
                onClick={handlePasswordSubmit(onSubmitPassword)}
              >
                {passwordMutation.isPending ? (
                  <>
                    <Spinner /> {t('saving')}
                  </>
                ) : (
                  t('updatePassword')
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconShield}
            title={t('twoFactorTitle')}
            description={t('twoFactorDesc')}
          />
        </CardHeader>

        <CardContent>
          <div className="border-input bg-muted/20 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-dashed p-4">
            <div className="pr-4">
              <span className="block text-sm font-medium">
                {t('enableTwoFactor')}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                {t('twoFactorHint')}
              </span>
            </div>
            <Switch
              checked={watchTwoFactor('isTwoFactorEnabled')}
              disabled={twoFactorMutation.isPending}
              onCheckedChange={(v) =>
                setTwoFactorValue('isTwoFactorEnabled', v, {
                  shouldDirty: true,
                })
              }
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
          {isTwoFactorDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => resetTwoFactor()}
              disabled={twoFactorMutation.isPending}
            >
              {t('reset')}
            </Button>
          )}
          <Button
            size="sm"
            disabled={twoFactorMutation.isPending || !isTwoFactorDirty}
            onClick={handleTwoFactorSubmit(onSubmitTwoFactor)}
          >
            {twoFactorMutation.isPending ? (
              <>
                <Spinner /> {t('saving')}
              </>
            ) : (
              t('saveSettings')
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
