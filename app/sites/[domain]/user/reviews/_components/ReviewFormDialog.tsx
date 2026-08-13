/* eslint-disable @next/next/no-img-element */
'use client'

import { Controller, FormProvider, useForm } from 'react-hook-form'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import {
  useCreateReview,
  useUpdateReview,
} from '@/actions/hooks/storefront/review'
import { ImageUploadSection } from '@/app/(main)/merchant/store-settings/products/create/_components/ImageUploadSection'
import { getPathR2FromUrl } from '@/utils/image'
import { ReviewFormValues, reviewFormSchema } from '@/zod/storefront/review'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconStar, IconStarFilled } from '@tabler/icons-react'

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
  const isEditing = !!initialData?.id

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
          url: img,
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

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const oldImageUrls =
        initialData?.images?.filter(
          (img): img is string => typeof img === 'string',
        ) || []

      const processedImages = await Promise.all(
        (data.images || []).map(async (img) => {
          const rawFile = img.file || (img.url instanceof File ? img.url : null)
          let finalUrl = typeof img.url === 'string' ? img.url : ''

          if (rawFile instanceof File) {
            const formData = new FormData()
            formData.append('file', rawFile)
            const res = await uploadMutation.mutateAsync(formData)
            if (res?.success && res?.url) finalUrl = res.url
          }
          return { url: finalUrl, isPrimary: Boolean(img.isPrimary) }
        }),
      )

      const validImages = processedImages
        .filter((img) => img.url !== '')
        .map((img) => img.url)
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
      }

      if (isEditing && initialData?.id) {
        updateMutation.mutate(
          { id: initialData.id, input },
          { onSuccess: (res) => res.success && onClose() },
        )
      } else if (targetInfo) {
        createMutation.mutate(
          { ...targetInfo, ...input },
          { onSuccess: (res) => res.success && onClose() },
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไขรีวิวสินค้า' : 'เขียนรีวิวสินค้า'}
          </DialogTitle>
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
                    ให้คะแนนสินค้า
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
                <FieldLabel className="text-sm font-medium">
                  ความคิดเห็นของคุณ
                </FieldLabel>
                <Textarea
                  {...register('comment')}
                  placeholder="แบ่งปันความประทับใจเกี่ยวกับสินค้าชิ้นนี้..."
                  rows={4}
                />
                {errors.comment && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.comment.message}
                  </p>
                )}
              </Field>
              <Field>
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
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'กำลังบันทึก...'
                  : isEditing
                    ? 'บันทึกการแก้ไข'
                    : 'ส่งรีวิว'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
