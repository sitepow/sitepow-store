'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { useReviewRewardConfig } from '@/actions/hooks/store-reward-review'
import {
  useCreateReview,
  useUpdateReview,
} from '@/actions/hooks/storefront/review'
import { getPathR2FromUrl } from '@/utils/image'
import { calculateReviewPoints } from '@/utils/review-points'
import { ReviewFormValues, reviewFormSchema } from '@/zod/storefront/review'

interface InitialReviewData {
  id?: string
  rating: number
  comment: string
  images?: (string | File)[]
  video?: string
}

interface ReviewTargetInfo {
  storeId: string
  productId: string
  variantId: string
  orderId?: string
  productTitle?: string
  productImage?: string
}

interface UseReviewFormDialogProps {
  initialData?: InitialReviewData
  targetInfo?: ReviewTargetInfo
  onClose: () => void
}

interface ReviewImageObject {
  url?: string | File
  file?: File
  isPrimary?: boolean
}

export function useReviewFormDialog({
  initialData,
  targetInfo,
  onClose,
}: UseReviewFormDialogProps) {
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
      ?.map((img: ReviewImageObject | File | string) => {
        if (typeof img === 'string') return img
        if (img instanceof File) return URL.createObjectURL(img)
        if (typeof img?.url === 'string') return img.url
        if (img?.url instanceof File) return URL.createObjectURL(img.url)
        if (img?.file instanceof File) return URL.createObjectURL(img.file)
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
        (data.images || []).map(async (rawItem: ReviewImageObject | File | string) => {
          let fileObj: File | null = null
          let currentUrl = ''

          if (typeof rawItem === 'object' && rawItem !== null && 'url' in rawItem && rawItem.url instanceof File) {
            fileObj = rawItem.url
          } else if (rawItem instanceof File) {
            fileObj = rawItem
          } else if (typeof rawItem === 'object' && rawItem !== null && 'file' in rawItem && rawItem.file instanceof File) {
            fileObj = rawItem.file
          } else if (typeof rawItem === 'object' && rawItem !== null && 'url' in rawItem && typeof rawItem.url === 'string') {
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

  return {
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
    handleSubmit: handleSubmit(onSubmit),
  }
}
