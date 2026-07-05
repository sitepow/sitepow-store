'use client'

import { ComponentProps, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { useProfile, useUpdateProfile } from '@/actions/hooks/profile'
import { r2DeleteImage, r2UploadImage } from '@/actions/r2'
import { getPathR2FromUrl } from '@/utils/image'
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

export function ProfileForm({ ...props }: ComponentProps<typeof Card>) {
  const { data: profile } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
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
      phone: profile.phone ?? undefined,
    }
    reset(values, { keepDefaultValues: false })
  }, [profile, reset])

  useEffect(() => {
    resetForm()
  }, [profile, reset, resetForm])

  async function onSubmit(values: UpdateProfileSchema) {
    let imageUrl = values.image

    if (values.image instanceof File) {
      if (profile?.image) {
        const oldKey = getPathR2FromUrl(profile.image)
        await r2DeleteImage(oldKey)
      }

      const formData = new FormData()
      formData.append('file', values.image)

      const res = await r2UploadImage(formData, `user/${profile?.id}`)
      if (res.success) {
        imageUrl = res.url
      }
    }

    updateProfile(
      {
        ...values,
        image: imageUrl,
      },
      {
        onSuccess: async () => {
          reset(values)
        },
      },
    )
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        <CardDescription>
          ข้อมูลนี้จะใช้สำหรับระบุตัวตนของคุณในฐานะเจ้าของระบบและใช้รับอีเมลแจ้งเตือนสำคัญ
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
        <Field>
          <FieldLabel>อีเมลหลักของบัญชี (ล็อกอิน)</FieldLabel>
          <Input type="email" value={profile?.email ?? ''} disabled />
          <FieldDescription>
            อีเมลล็อกอินไม่สามารถเปลี่ยนได้เอง กรุณาติดต่อฝ่ายสนับสนุน
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel>เบอร์โทรศัพท์ติดต่อ</FieldLabel>
          <Input {...register('phone')} />
          <FieldError>{errors.phone?.message}</FieldError>
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
          {isPending ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์ส่วนตัว'}
        </Button>
      </CardFooter>
    </Card>
  )
}
