'use client'

import { ComponentProps, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useProfile, useUpdateProfile } from '@/actions/account/profile/hooks'
import { formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { UpdateProfileSchema, updateProfileSchema } from '@/zod/account/profile'
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
        <CardTitle>แก้ไขข้อมูลส่วนบุคคล</CardTitle>
        <CardDescription>
          อัปเดตข้อมูลของคุณให้เป็นปัจจุบัน
          เพื่อประโยชน์ในการติดต่อประสานงานและจัดส่งสินค้า
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>ชื่อจริง</FieldLabel>
          <Input {...register('firstName')} />
          <FieldError>{errors.firstName?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>นามสกุล</FieldLabel>
          <Input {...register('lastName')} />
          <FieldError>{errors.lastName?.message}</FieldError>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>อีเมลลงทะเบียน (ใช้เข้าสู่ระบบ)</FieldLabel>
          <Input value={profile?.email ?? ''} disabled />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>เบอร์โทรศัพท์ติดต่อหลัก</FieldLabel>
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
                placeholder="เช่น 0812345678"
                inputMode="numeric"
              />
            )}
          />
          <FieldError>{errors.phone?.message}</FieldError>
          <FieldDescription>
            เบอร์โทรศัพท์นี้ระบบจะใช้เชื่อมโยงกับฐานข้อมูลสมาชิกร้านค้า (Loyalty
            Points) เพื่อสะสมแต้มให้คุณโดยอัตโนมัติ
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
        {isDirty && (
          <Button type="button" variant="outline" onClick={resetForm}>
            ล้างค่าการตั้งค่า
          </Button>
        )}

        <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
          <IconDeviceFloppy size={14} />
          {isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูลโปรไฟล์'}
        </Button>
      </CardFooter>
    </Card>
  )
}
