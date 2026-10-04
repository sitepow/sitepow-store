/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import {
  useStoreProfile,
  useUpdateStoreProfile,
} from '@/actions/store/profile/hooks'
import { PRIMARY_COLOR_OPTIONS } from '@/constants/system'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { getPathR2FromUrl } from '@/utils/media/image'
import { StoreProfileFormValues, storeProfileSchema } from '@/zod/store/store-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingStore } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreLogo } from '@/components/brand/StoreLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export function StoreProfileForm() {
  const { selectedStoreId } = useStoreFilter()
  const { data: storeProfile } = useStoreProfile(selectedStoreId as string)
  const profileMutation = useUpdateStoreProfile()

  const uploadLogoMutation = useR2UploadImage(`store/${selectedStoreId}/logo`)
  const uploadBannerMutation = useR2UploadImage(
    `store/${selectedStoreId}/banner`,
  )
  const deleteMutation = useR2DeleteImage()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
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
      coverImage: '',
      primaryColor: '',
      description: '',
    },
  })

  const logo = watch('logo')
  const coverImage = watch('coverImage')

  const isVideo =
    (coverImage instanceof File && coverImage.type.startsWith('video/')) ||
    (typeof coverImage === 'string' && coverImage.match(/\.(mp4|webm|ogg)$/i))

  const previewLogoUrl = useMemo(() => {
    if (logo instanceof File) {
      return URL.createObjectURL(logo)
    }

    return logo
  }, [logo])

  useEffect(() => {
    return () => {
      if (previewLogoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewLogoUrl)
      }
    }
  }, [previewLogoUrl])

  const previewBannerUrl = useMemo(() => {
    if (coverImage instanceof File) {
      return URL.createObjectURL(coverImage)
    }

    return coverImage
  }, [coverImage])

  useEffect(() => {
    return () => {
      if (previewBannerUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewBannerUrl)
      }
    }
  }, [previewBannerUrl])

  const resetForm = useCallback(() => {
    if (storeProfile) {
      reset({
        ...storeProfile,
        email: storeProfile.email ?? '',
        taxId: storeProfile.taxId ?? '',
        description: storeProfile.description ?? '',
        primaryColor: storeProfile.primaryColor ?? '',
      })
    }
  }, [storeProfile, reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit = async (values: StoreProfileFormValues) => {
    let logoUrl = values.logo
    let bannerUrl = values.coverImage

    if (values.logo instanceof File) {
      if (storeProfile?.logo) {
        const oldKey = getPathR2FromUrl(storeProfile.logo)
        if (oldKey) {
          await deleteMutation.mutateAsync(oldKey)
        }
      }

      const res = await uploadLogoMutation.mutateAsync(values.logo)
      if (res?.success && res?.url) {
        logoUrl = res.url
      }
    }

    if (values.coverImage instanceof File) {
      if (storeProfile?.coverImage) {
        const oldKey = getPathR2FromUrl(storeProfile.coverImage)
        if (oldKey) {
          await deleteMutation.mutateAsync(oldKey)
        }
      }

      const res = await uploadBannerMutation.mutateAsync(values.coverImage)
      if (res?.success && res?.url) {
        bannerUrl = res.url
      }
    }

    profileMutation.mutate(
      {
        storeId: selectedStoreId as string,
        input: {
          ...values,
          logo: logoUrl,
          coverImage: bannerUrl,
        },
      },
      { onSuccess: () => reset(values) },
    )
  }

  const isPending =
    profileMutation.isPending ||
    uploadLogoMutation.isPending ||
    uploadBannerMutation.isPending ||
    deleteMutation.isPending

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconBuildingStore}
          title="ตั้งค่าข้อมูลร้านค้า"
          description="แก้ไขข้อมูลสาขาหลัก, URL Slug หน้าระบบ และข้อมูลข้อความหมายเหตุที่จะปรากฏในกระดาษใบเสร็จ POS"
        />
      </CardHeader>
      {selectedStoreId === ALL_STORES ? (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel>โลโก้ประจำแบรนด์ร้านค้า</FieldLabel>
                <div className="flex flex-wrap items-center gap-5">
                  <div className="border-primary flex h-16.25 shrink-0 items-center justify-center border border-dashed p-1">
                    {logo && <StoreLogo image={previewLogoUrl ?? logo} />}
                    {!logo && <StoreLogo />}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
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
                      className="w-full"
                      onClick={() => logoInputRef.current?.click()}
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
              <Field>
                <FieldLabel>รูปภาพแบนเนอร์หน้าร้าน</FieldLabel>
                <div className="flex flex-col gap-3">
                  {coverImage && (
                    <div className="border-primary border border-dashed p-1">
                      {isVideo ? (
                        <video
                          src={previewBannerUrl ?? coverImage}
                          className="h-32 w-full object-cover object-center"
                        />
                      ) : (
                        <img
                          src={previewBannerUrl ?? coverImage}
                          className="h-32 w-full object-cover object-center"
                        />
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    อัปโหลดรูปภาพแบนเนอร์
                  </Button>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) =>
                      setValue('coverImage', e.target.files?.[0], {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
                <FieldDescription className="max-w-xs text-xs leading-normal">
                  แนะนำไฟล์สี่เหลี่ยมจัตุรัส PNG หรือ JPG หรือ MP4 ขนาดไม่เกิน
                  10MB (ขนาดรูปที่แนะนำ 1980x500) สามารถใช้ไฟล์วิดีโอได้
                </FieldDescription>
              </Field>
            </div>
            <Separator />
            <Field>
              <FieldLabel>สีประจำแบรนด์ (Primary Color)</FieldLabel>
              <Controller
                control={control}
                name="primaryColor"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสีประจำแบรนด์" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIMARY_COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-black/10"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                เลือกสีหลักสำหรับปุ่มและองค์ประกอบสำคัญในหน้าร้านของคุณ
              </FieldDescription>
            </Field>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel>ชื่อร้านค้า / ชื่อจดทะเบียนพาณิชย์</FieldLabel>
                <Input
                  placeholder="ระบุชื่อเต็มของร้านค้า"
                  {...register('name')}
                  disabled={isPending}
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
                  disabled={isPending}
                />
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>เลขประจำตัวผู้เสียภาษี 13 หลัก</FieldLabel>
                <Input
                  maxLength={13}
                  placeholder="เลขประจำตัวผู้เสียภาษีสำหรับระบุบนใบเสร็จเต็มรูปแบบ"
                  {...register('taxId')}
                  disabled={isPending}
                />
                <FieldError>{errors?.taxId?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>รายละเอียดร้านค้า</FieldLabel>
                <Textarea
                  placeholder="ร้านค้านี้ขายเกี่ยวกับอะไร"
                  {...register('description')}
                  disabled={isPending}
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
                disabled={isPending}
              >
                ล้างค่าการตั้งค่า
              </Button>
            )}
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {isPending ? (
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
