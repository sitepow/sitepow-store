'use client'

import { useForm } from 'react-hook-form'

import { useUpdatePassword } from '@/actions/storefront/security/hooks'
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
            title="เปลี่ยนรหัสผ่าน"
            description="แนะนำให้ใช้รหัสผ่านที่ปลอดภัย ผสมอักษรและตัวเลข เพื่อปกป้องกระเป๋าเงินรวมถึงแต้มสะสมทั้งหมดของคุณ"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Field>
              <FieldLabel>รหัสผ่านปัจจุบัน</FieldLabel>
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
              <FieldLabel>รหัสผ่านใหม่</FieldLabel>
              <Input
                type="password"
                {...register('newPassword')}
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
              {errors.newPassword && (
                <FieldError>{errors.newPassword.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>ยืนยันรหัสผ่านใหม่</FieldLabel>
              <Input
                type="password"
                {...register('confirmPassword')}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
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
              ล้างค่าการตั้งค่า
            </Button>
          )}

          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? 'กำลังบันทึก...' : 'อัปเดตรหัสผ่าน'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
