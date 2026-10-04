'use client'

import { ComponentProps, useCallback, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { useProfile, useUpdateProfile } from '@/actions/account/profile/hooks'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import { getPathR2FromUrl } from '@/utils/media/image'
import { formatPhoneInput, formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { UpdateProfileSchema } from '@/zod/account/profile'
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
        <Field className="col-span-2">
          <FieldLabel>หมายเลขโทรศัพท์ติดต่อ *</FieldLabel>
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
            ล้างค่าการตั้งค่า
          </Button>
        )}

        <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
          {isPending ? (
            <Spinner className="mr-2" />
          ) : (
            <IconDeviceFloppy size={14} className="mr-2" />
          )}
          {isPending ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์ส่วนตัว'}
        </Button>
      </CardFooter>
    </Card>
  )
}
