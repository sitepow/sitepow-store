'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.reviewReward')
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
      <Card
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
        <CardContent className="flex items-center justify-center p-12">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconStar}
          title={t('title')}
          description={t('description')}
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
                <FieldLabel className="text-base">{t('enable')}</FieldLabel>
                <FieldDescription>{t('enableDesc')}</FieldDescription>
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
                <FieldLabel>{t('basePoints')}</FieldLabel>
                <Input
                  type="number"
                  placeholder="10"
                  {...register('basePoints', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>{t('basePointsDesc')}</FieldDescription>
                <FieldError>{errors?.basePoints?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('photoBonus')}</FieldLabel>
                <Input
                  type="number"
                  placeholder="5"
                  {...register('photoBonus', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>{t('photoBonusDesc')}</FieldDescription>
                <FieldError>{errors?.photoBonus?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('videoBonus')}</FieldLabel>
                <Input
                  type="number"
                  placeholder="20"
                  {...register('videoBonus', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>{t('videoBonusDesc')}</FieldDescription>
                <FieldError>{errors?.videoBonus?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('longReviewBonus')}</FieldLabel>
                <Input
                  type="number"
                  placeholder="10"
                  {...register('longReviewBonus', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>{t('longReviewBonusDesc')}</FieldDescription>
                <FieldError>{errors?.longReviewBonus?.message}</FieldError>
              </Field>
              <Field className="lg:col-span-2">
                <FieldLabel>{t('minCommentLength')}</FieldLabel>
                <Input
                  type="number"
                  placeholder="50"
                  {...register('minCommentLength', { valueAsNumber: true })}
                  disabled={isFieldsDisabled}
                />
                <FieldDescription>{t('minCommentLengthDesc')}</FieldDescription>
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
                {t('reset')}
              </Button>
            )}
            <Button
              size="sm"
              disabled={updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner /> {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
