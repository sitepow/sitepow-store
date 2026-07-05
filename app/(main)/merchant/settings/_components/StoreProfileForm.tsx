'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'

import {
  useStoreProfile,
  useUpdateStoreProfile,
} from '@/actions/hooks/store-profile'
import { r2DeleteImage, r2UploadImage } from '@/actions/r2'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { StoreProfileFormValues, storeProfileSchema } from '@/zod/store-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingStore } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreLogo } from '@/components/StoreLogo'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export function StoreProfileForm() {
  const { selectedStoreId } = useStoreFilter()
  const { data: storeProfile } = useStoreProfile(selectedStoreId as string)
  const profileMutation = useUpdateStoreProfile()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      taxId: '',
      logo: '',
      description: '',
    },
  })

  const logo = watch('logo')

  const previewUrl = useMemo(() => {
    if (logo instanceof File) {
      return URL.createObjectURL(logo)
    }

    return logo
  }, [logo])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const resetForm = useCallback(() => {
    if (storeProfile) {
      reset({
        ...storeProfile,
        email: storeProfile.email ?? '',
        taxId: storeProfile.taxId ?? '',
        description: storeProfile.description ?? '',
      })
    }
  }, [storeProfile, reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit = async (values: StoreProfileFormValues) => {
    let logoUrl = values.logo

    if (values.logo instanceof File) {
      if (storeProfile?.logo) {
        const oldKey = getPathR2FromUrl(storeProfile.logo)
        await r2DeleteImage(oldKey)
      }

      const formData = new FormData()
      formData.append('file', values.logo)

      const res = await r2UploadImage(formData, `store/${selectedStoreId}`)
      if (res.success) {
        logoUrl = res.url
      }
    }

    profileMutation.mutate(
      {
        storeId: selectedStoreId as string,
        input: { ...values, logo: logoUrl },
      },
      { onSuccess: () => reset(values) },
    )
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconBuildingStore}
          title="ข้อมูลโปรไฟล์แบรนด์และร้านค้าหลัก"
          description="แก้ไขข้อมูลสาขาหลัก, URL Slug หน้าระบบ และข้อมูลข้อความหมายเหตุที่จะปรากฏในกระดาษใบเสร็จ POS"
          endContent={<StoreSelectField />}
        />
      </CardHeader>

      {selectedStoreId === ALL_STORES ? (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel>โลโก้ประจำแบรนด์ร้านค้า</FieldLabel>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex h-16.25 w-50 shrink-0 items-center justify-center">
                  {logo && <StoreLogo image={previewUrl ?? logo} />}
                  {!logo && <StoreLogo />}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]

                    if (file) {
                      setValue('logo', file, { shouldDirty: true })
                    }
                  }}
                />

                <div className="space-y-2 pt-1">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    อัปโหลดรูปภาพใหม่
                  </Button>
                  <FieldDescription className="max-w-xs text-xs leading-normal">
                    แนะนำไฟล์สี่เหลี่ยมจัตุรัส PNG หรือ JPG ขนาดไม่เกิน 2MB
                    (ขนาดรูปที่แนะนำ 200x70)
                  </FieldDescription>
                </div>
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel>ชื่อร้านค้า / ชื่อจดทะเบียนพาณิชย์</FieldLabel>
                <Input
                  placeholder="ระบุชื่อเต็มของร้านค้า"
                  {...register('name')}
                  disabled={profileMutation.isPending}
                />
                <FieldError>{errors?.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Store URL Slug</FieldLabel>
                <div className="flex items-center overflow-hidden rounded-md">
                  <span className="border-input bg-muted text-muted-foreground flex h-9 items-center border border-r-0 px-3 text-sm select-none">
                    sitepow.store/
                  </span>
                  <Input
                    className="rounded-l-none"
                    {...register('slug')}
                    disabled
                  />
                </div>
                <FieldError>{errors?.slug?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>อีเมลติดต่อหลัก</FieldLabel>
                <Input
                  type="email"
                  placeholder="example@store.com"
                  {...register('email')}
                  disabled={profileMutation.isPending}
                />
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>เลขประจำตัวผู้เสียภาษี 13 หลัก</FieldLabel>
                <Input
                  maxLength={13}
                  placeholder="เลขประจำตัวผู้เสียภาษีสำหรับระบุบนใบเสร็จเต็มรูปแบบ"
                  {...register('taxId')}
                  disabled={profileMutation.isPending}
                />
                <FieldError>{errors?.taxId?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>รายละเอียดร้านค้า</FieldLabel>
                <Textarea
                  placeholder="ร้านค้านี้ขายเกี่ยวกับอะไร"
                  {...register('description')}
                  disabled={profileMutation.isPending}
                />
                <FieldError>{errors?.taxId?.message}</FieldError>
              </Field>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={profileMutation.isPending}
              >
                ล้างค่าการตั้งค่า
              </Button>
            )}
            <Button
              size="sm"
              disabled={profileMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {profileMutation.isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : (
                'บันทึกการตั้งค่าร้านค้า'
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
