'use client'

import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useStoreProfile,
  useUpdateStoreProfile,
} from '@/actions/hooks/store-profile'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { StoreProfileFormValues, storeProfileSchema } from '@/zod/store-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingStore, IconPhoto } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
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

export function StoreProfileForm() {
  const { selectedStoreId } = useStoreFilter()
  const { data: storeProfile } = useStoreProfile(selectedStoreId as string)
  const profileMutation = useUpdateStoreProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      taxId: '',
    },
  })

  const resetFormToDefaultDatabase = useCallback(() => {
    if (storeProfile) {
      reset({
        name: storeProfile.name,
        slug: storeProfile.slug,
        email: storeProfile.email ?? '',
        taxId: storeProfile.taxId ?? '',
      })
    }
  }, [storeProfile, reset])

  useEffect(() => {
    resetFormToDefaultDatabase()
  }, [resetFormToDefaultDatabase])

  const onSubmit = (values: StoreProfileFormValues) => {
    profileMutation.mutate(
      { storeId: selectedStoreId as string, input: values },
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
              <div className="flex items-center gap-5">
                <div className="flex size-32 shrink-0 items-center justify-center rounded-xl border border-dashed">
                  <IconPhoto size={24} stroke={1.5} />
                </div>
                <div className="space-y-2 pt-1">
                  <Button variant="outline" type="button">
                    อัปโหลดรูปภาพใหม่
                  </Button>
                  <FieldDescription className="max-w-xs text-xs leading-normal">
                    แนะนำไฟล์สี่เหลี่ยมจัตุรัส PNG หรือ JPG ขนาดไม่เกิน 2MB
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
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={resetFormToDefaultDatabase}
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
