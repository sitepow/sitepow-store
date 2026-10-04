'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useSecuritySettings,
  useUpdateSecuritySettings,
  useUpdateTwoFactor,
} from '@/actions/account/security/hooks'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  ChangePasswordFormValues,
  TwoFactorFormValues,
  changePasswordSchema,
  twoFactorSchema,
} from '@/zod/account/security'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLock, IconShield } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

export function SecuritySettingsForm() {
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
            title="เปลี่ยนรหัสผ่าน"
            description="ปรับเปลี่ยนรหัสผ่านเพื่อการเข้าถึงฐานระบบหลัก มีผลบังคับใช้ครอบคลุมทุกแบรนด์ภายใต้สัญญานี้"
          />
        </CardHeader>

        {selectedStoreId !== ALL_STORES && (
          <>
            <CardContent className="space-y-5">
              <Field>
                <FieldLabel>รหัสผ่านปัจจุบัน</FieldLabel>
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
                  <FieldLabel>รหัสผ่านใหม่</FieldLabel>
                  <Input
                    type="password"
                    placeholder="ความยาวขั้นต่ำ 8 ตัวอักษร"
                    {...register('newPassword')}
                    disabled={passwordMutation.isPending}
                  />
                  <FieldError>
                    {passwordErrors?.newPassword?.message}
                  </FieldError>
                </Field>
                <Field>
                  <FieldLabel>ยืนยันรหัสผ่านใหม่</FieldLabel>
                  <Input
                    type="password"
                    placeholder="กรอกให้ตรงกับช่องด้านซ้าย"
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
                  ล้างค่าการตั้งค่า
                </Button>
              )}

              <Button
                size="sm"
                disabled={passwordMutation.isPending}
                onClick={handlePasswordSubmit(onSubmitPassword)}
              >
                {passwordMutation.isPending ? (
                  <>
                    <Spinner /> กำลังบันทึก...
                  </>
                ) : (
                  'อัปเดตรหัสผ่าน'
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
            title="การยืนยันตัวตน 2 ชั้น (2FA)"
            description="เพิ่มความปลอดภัยโดยให้ระบบส่งรหัส OTP ผ่านอีเมลทุกครั้งที่มีการล็อกอินจากอุปกรณ์ใหม่"
          />
        </CardHeader>

        <CardContent>
          <div className="border-input bg-muted/20 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-dashed p-4">
            <div className="pr-4">
              <span className="block text-sm font-medium">
                เปิดใช้งานการยืนยันตัวตน 2 ชั้น
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                ระบบจะบังคับส่งรหัส OTP
                ผ่านอีเมลทุกครั้งที่มีการล็อกอินจากอุปกรณ์ใหม่
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
              ล้างค่าการตั้งค่า
            </Button>
          )}
          <Button
            size="sm"
            disabled={twoFactorMutation.isPending || !isTwoFactorDirty}
            onClick={handleTwoFactorSubmit(onSubmitTwoFactor)}
          >
            {twoFactorMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'บันทึกการตั้งค่า'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
