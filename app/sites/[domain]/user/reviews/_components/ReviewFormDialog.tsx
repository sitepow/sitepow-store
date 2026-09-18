/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { FormProvider } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconSparkles } from '@tabler/icons-react'

import { ImageUploadSection } from '@/app/(main)/merchant/store-settings/products/create/_components/ImageUploadSection'
import { formatNumber } from '@/utils/pricing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

import { useReviewFormDialog } from '../_hooks/use-review-form-dialog'
import { ReviewRatingStars } from './ReviewRatingStars'

interface ReviewFormDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id?: string
    rating: number
    comment: string
    images?: (string | File)[]
    video?: string
  }
  targetInfo?: {
    storeId: string
    productId: string
    variantId: string
    orderId?: string
    productTitle?: string
    productImage?: string
  }
}

export function ReviewFormDialog({
  isOpen,
  onClose,
  initialData,
  targetInfo,
}: ReviewFormDialogProps) {
  const t = useTranslations('customer.reviews')
  const tCommon = useTranslations('common')

  const {
    form,
    register,
    control,
    errors,
    watchedComment,
    isEditing,
    isRewardEnabled,
    calculatedPoints,
    rewardConfig,
    isPending,
    handleSubmit,
  } = useReviewFormDialog({
    initialData,
    targetInfo,
    onClose,
  })

  const photoBonusText = rewardConfig?.photoBonus ?? 5

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? t('dialogEditTitle') : t('dialogTitle')}
            </DialogTitle>
            {isRewardEnabled && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 border-amber-200 bg-amber-50 px-3 py-1 text-amber-600"
              >
                <IconSparkles className="size-4 text-amber-500" />
                <span>
                  {t('earnPoints', {
                    points: formatNumber(calculatedPoints.totalPoints),
                  })}
                </span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        {targetInfo?.productTitle && (
          <div className="flex items-center gap-3 border-b pb-3">
            {targetInfo.productImage && (
              <img
                src={targetInfo.productImage}
                alt={targetInfo.productTitle}
                className="size-12 rounded-md object-cover"
              />
            )}
            <span className="line-clamp-2 text-sm font-medium">
              {targetInfo.productTitle}
            </span>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <FieldGroup className="space-y-4">
              <ReviewRatingStars
                control={control}
                error={errors.rating?.message}
              />

              <Field>
                <div className="mb-1 flex items-center justify-between">
                  <FieldLabel className="text-sm font-medium">
                    {t('yourComment')}
                  </FieldLabel>
                  <span className="text-muted-foreground text-xs">
                    {(watchedComment || '').trim().length} {t('characters')}
                  </span>
                </div>
                <Textarea
                  {...register('comment')}
                  placeholder={t('commentPlaceholder')}
                  rows={4}
                />
                {errors.comment && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.comment.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="mb-1 flex items-center justify-between">
                  <FieldLabel className="text-sm font-medium">
                    {t('productPhotos')}
                  </FieldLabel>
                  <span className="text-muted-foreground text-xs">
                    {isRewardEnabled
                      ? t('photoBonus', { bonus: photoBonusText })
                      : t('maxPhotos')}
                  </span>
                </div>
                <ImageUploadSection showPrimaryControl={false} />
                {typeof errors.images?.message === 'string' && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.images.message}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('saving')
                  : isEditing
                    ? t('saveChanges')
                    : t('submitReview')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
