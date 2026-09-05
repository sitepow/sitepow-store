/* eslint-disable @next/next/no-img-element */
'use client'

import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { useReviewRewardConfig } from '@/actions/hooks/store-reward-review'
import {
  useCreateReview,
  useUpdateReview,
} from '@/actions/hooks/storefront/review'
import { ImageUploadSection } from '@/app/(main)/merchant/store-settings/products/create/_components/ImageUploadSection'
import { getPathR2FromUrl } from '@/utils/image'
import { formatNumber } from '@/utils/pricing'
import { calculateReviewPoints } from '@/utils/review-points'
import { ReviewFormValues, reviewFormSchema } from '@/zod/storefront/review'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconSparkles, IconStar, IconStarFilled } from '@tabler/icons-react'

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
  const isEditing = !!initialData?.id

  const { data: rewardConfigRes } = useReviewRewardConfig(
    targetInfo?.storeId || '',
  )
  const rewardConfig = rewardConfigRes?.data
  const isRewardEnabled = rewardConfig?.isEnabled ?? false

  const createMutation = useCreateReview()
  const updateMutation = useUpdateReview()

  const uploadMutation = useR2UploadImage(
    `store/${targetInfo?.storeId || 'reviews'}/reviews`,
  )
  const deleteMutation = useR2DeleteImage()

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: initialData?.rating || 5,
      comment: initialData?.comment || '',
      images:
        initialData?.images?.map((img) => ({
          url: img instanceof File ? URL.createObjectURL(img) : img,
          isPrimary: false,
          file: img instanceof File ? img : undefined,
        })) ?? [],
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  const watchedRating = useWatch({ control, name: 'rating' })
  const watchedComment = useWatch({ control, name: 'comment' })
  const watchedImages = useWatch({ control, name: 'images' })

  const imageStringUrls =
    watchedImages
      ?.map((img: any) => {
        if (typeof img?.url === 'string') return img.url
        if (img?.url instanceof File) return URL.createObjectURL(img.url)
        if (img?.file instanceof File) return URL.createObjectURL(img.file)
        if (img instanceof File) return URL.createObjectURL(img)

        return null
      })
      .filter((url): url is string => Boolean(url)) || []

  const calculatedPoints = calculateReviewPoints({
    rating: watchedRating || 5,
    comment: watchedComment || '',
    images: imageStringUrls,
    config: rewardConfig,
  })

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const oldImageUrls =
        initialData?.images?.filter(
          (img): img is string => typeof img === 'string',
        ) || []

      let uploadedVideoUrl: string | undefined = initialData?.video

      const processedImages = await Promise.all(
        (data.images || []).map(async (rawItem: any) => {
          let fileObj: File | null = null
          let currentUrl = ''

          if (rawItem?.url instanceof File) {
            fileObj = rawItem.url
          } else if (rawItem instanceof File) {
            fileObj = rawItem
          } else if (rawItem?.file instanceof File) {
            fileObj = rawItem.file
          } else if (typeof rawItem?.url === 'string') {
            currentUrl = rawItem.url
          } else if (typeof rawItem === 'string') {
            currentUrl = rawItem
          }

          if (currentUrl && !currentUrl.startsWith('blob:')) {
            return { url: currentUrl, isVideo: false }
          }

          if (!fileObj && currentUrl.startsWith('blob:')) {
            try {
              const res = await fetch(currentUrl)
              const blob = await res.blob()
              fileObj = new File([blob], `review-media-${Date.now()}`, {
                type: blob.type || 'image/jpeg',
              })
            } catch (e) {
              console.error(e)
            }
          }

          if (fileObj) {
            const isVideo = fileObj.type.startsWith('video/')
            const formData = new FormData()
            formData.append('file', fileObj)

            const res = await uploadMutation.mutateAsync(formData)

            if (res?.success && res?.url) {
              if (isVideo) {
                uploadedVideoUrl = res.url
                return null
              }
              return { url: res.url, isVideo: false }
            }
          }

          return null
        }),
      )

      const validImages = processedImages
        .filter((item): item is { url: string; isVideo: boolean } =>
          Boolean(item?.url),
        )
        .map((item) => item.url)

      const imagesToDelete = oldImageUrls.filter(
        (url) => !validImages.includes(url),
      )

      await Promise.all(
        imagesToDelete.map(async (url) => {
          const path = getPathR2FromUrl(url)
          if (path) await deleteMutation.mutateAsync(path)
        }),
      )

      const input = {
        rating: data.rating,
        comment: data.comment,
        images: validImages,
        video: uploadedVideoUrl,
      }

      if (isEditing && initialData?.id) {
        updateMutation.mutate(
          { id: initialData.id, input },
          {
            onSuccess: (res) => {
              if (res.success) onClose()
            },
          },
        )
      } else if (targetInfo) {
        createMutation.mutate(
          {
            storeId: targetInfo.storeId,
            productId: targetInfo.productId,
            variantId: targetInfo.variantId,
            orderId: targetInfo.orderId,
            ...input,
          },
          {
            onSuccess: (res) => {
              if (res.success) onClose()
            },
          },
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FieldGroup className="space-y-4">
              <Field>
                <div className="flex flex-col items-center justify-center gap-1 py-2">
                  <FieldLabel className="text-muted-foreground text-sm">
                    {t('rateProduct')}
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= field.value
                          return (
                            <button
                              key={star}
                              type="button"
                              className="p-1 focus:outline-none"
                              onClick={() => field.onChange(star)}
                            >
                              {isFilled ? (
                                <IconStarFilled className="size-8 text-amber-400" />
                              ) : (
                                <IconStar className="size-8 text-gray-300" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  />
                  {errors.rating && (
                    <p className="text-destructive text-xs">
                      {errors.rating.message}
                    </p>
                  )}
                </div>
              </Field>
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
                {errors.images && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.images.message as string}
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
