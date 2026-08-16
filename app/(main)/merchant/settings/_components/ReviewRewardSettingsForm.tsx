'use client'

import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  useReviewRewardConfig,
  useUpdateReviewRewardConfig,
} from '@/actions/hooks/store-reward-review'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  ReviewRewardConfigFormValues,
  reviewRewardConfigSchema,
} from '@/zod/review-reward'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconStar } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

export function ReviewRewardSettingsForm() {
  const { selectedStoreId } = useStoreFilter()
  const storeId = selectedStoreId as string

  const { data: configRes, isLoading } = useReviewRewardConfig(
    selectedStoreId !== ALL_STORES ? storeId : '',
  )
  const updateMutation = useUpdateReviewRewardConfig(storeId)

  const configData = configRes?.success ? configRes.data : null

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { isDirty, errors },
  } = useForm<ReviewRewardConfigFormValues>({
    resolver: zodResolver(reviewRewardConfigSchema),
    defaultValues: {
      isEnabled: true,
      basePoints: 10,
      photoBonus: 5,
      videoBonus: 20,
      minCommentLength: 50,
      longReviewBonus: 10,
    },
  })

  const isEnabled = watch('isEnabled')
  const isFieldsDisabled = !isEnabled || updateMutation.isPending

  const resetForm = useCallback(() => {
    if (configData) {
      reset({
        isEnabled: configData.isEnabled ?? true,
        basePoints: configData.basePoints ?? 10,
        photoBonus: configData.photoBonus ?? 5,
        videoBonus: configData.videoBonus ?? 20,
        minCommentLength: configData.minCommentLength ?? 50,
        longReviewBonus: configData.longReviewBonus ?? 10,
      })
    }
  }, [configData, reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit = (values: ReviewRewardConfigFormValues) => {
    updateMutation.mutate(values)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconStar}
          title="ตั้งค่าคะแนนแจกจากการรีวิว"
          description="กำหนดกติกาการแจกพ้อยท์/คะแนนสะสมให้แก่ลูกค้าเมื่อทำการเขียนรีวิวสินค้า"
        />
      </CardHeader>
      {selectedStoreId === ALL_STORES ? (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-6">
            <Field className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs">
              <div className="space-y-0.5">
                <FieldLabel className="text-base">
                  เปิดใช้งานระบบแจกคะแนนรีวิว
                </FieldLabel>
                <FieldDescription>
                  เปิดให้ลูกค้าได้รับคะแนนสะสมเมื่อเขียนรีวิวสินค้าสำเร็จ
                </FieldDescription>
              </div>
              <Controller
                control={control}
                name="isEnabled"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={updateMutation.isPending}
                  />
                )}
              />
            </Field>
            <Separator />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel>คะแนนรีวิวพื้นฐาน (Base Points)</FieldLabel>
                <Input
                  type="number"
                  placeholder="10"
                  {...register('basePoints', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>
                  คะแนนที่ลูกค้าจะได้รับเมื่อเขียนรีวิวข้อความทั่วไป
                </FieldDescription>
                <FieldError>{errors?.basePoints?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>โบนัสแนบรูปภาพ (Photo Bonus)</FieldLabel>
                <Input
                  type="number"
                  placeholder="5"
                  {...register('photoBonus', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>
                  คะแนนพิเศษเพิ่มเมื่อมีการอัปโหลดรูปภาพประกอบรีวิว
                </FieldDescription>
                <FieldError>{errors?.photoBonus?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>โบนัสแนบวิดีโอ (Video Bonus)</FieldLabel>
                <Input
                  type="number"
                  placeholder="20"
                  {...register('videoBonus', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>
                  คะแนนพิเศษเพิ่มเมื่อมีการอัปโหลดวิดีโอประกอบรีวิว
                </FieldDescription>
                <FieldError>{errors?.videoBonus?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>โบนัสรีวิวยาว (Long Review Bonus)</FieldLabel>
                <Input
                  type="number"
                  placeholder="10"
                  {...register('longReviewBonus', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>
                  คะแนนพิเศษเพิ่มเมื่อความยาวของข้อความรีวิวถึงเกณฑ์ที่กำหนด
                </FieldDescription>
                <FieldError>{errors?.longReviewBonus?.message}</FieldError>
              </Field>
              <Field className="lg:col-span-2">
                <FieldLabel>จำนวนตัวอักษรขั้นต่ำสำหรับโบนัสรีวิวยาว</FieldLabel>
                <Input
                  type="number"
                  placeholder="50"
                  {...register('minCommentLength', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>
                  จำนวนตัวอักษรขั้นต่ำที่ลูกค้าต้องพิมพ์เพื่อที่จะได้รับคะแนนโบนัสรีวิวยาว
                </FieldDescription>
                <FieldError>{errors?.minCommentLength?.message}</FieldError>
              </Field>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={updateMutation.isPending}
              >
                ล้างค่าการตั้งค่า
              </Button>
            )}
            <Button
              size="sm"
              disabled={updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : (
                'บันทึกการตั้งค่าคะแนนรีวิว'
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
