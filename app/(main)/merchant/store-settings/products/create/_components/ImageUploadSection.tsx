/* eslint-disable @next/next/no-img-element */
'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'

import { ProductFormValues } from '@/zod/catalog/product'
import { ImagePlus, Star, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'

import { cn } from '@/lib/utils'

interface ImageUploadSectionProps {
  showPrimaryControl?: boolean
}

export function ImageUploadSection({
  showPrimaryControl = true,
}: ImageUploadSectionProps) {
  const { control, setValue, getValues } = useFormContext<ProductFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images',
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      return
    }

    const currentImages = getValues('images') || []

    for (let i = 0; i < files.length; i++) {
      const isFirstImage = currentImages.length === 0 && i === 0
      append({
        url: files[i],
        ...(showPrimaryControl && { isPrimary: isFirstImage }),
      })
    }
  }

  const handleSetPrimary = (targetIndex: number) => {
    if (!showPrimaryControl) return
    const currentImages = getValues('images') || []
    const updated = currentImages.map((img, idx) => ({
      ...img,
      isPrimary: idx === targetIndex,
    }))
    setValue('images', updated, { shouldDirty: true })
  }

  const handleRemoveImage = (index: number) => {
    const currentImages = getValues('images') || []
    const isRemovingPrimary =
      showPrimaryControl && currentImages[index]?.isPrimary

    remove(index)

    if (isRemovingPrimary && currentImages.length > 1 && showPrimaryControl) {
      const remainingImages = currentImages.filter((_, idx) => idx !== index)
      if (remainingImages.length > 0) {
        ;(remainingImages[0] as any).isPrimary = true
        setValue('images', remainingImages, { shouldDirty: true })
      }
    }
  }

  return (
    <FieldSet className="space-y-4">
      <FieldLegend variant="label" className="text-lg font-bold">
        สื่อประกอบ ({fields.length})
      </FieldLegend>
      <FieldDescription>
        รองรับรูปภาพและวิดีโอ (ขนาดไฟล์สูงสุด 10 MB)
      </FieldDescription>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {fields.map((field: any, index) => {
          const rawFile = field.url || field.file
          const isFileObj = rawFile instanceof File

          let previewUrl = ''
          if (typeof field.fileBase64 === 'string' && field.fileBase64) {
            previewUrl = field.fileBase64
          } else if (isFileObj) {
            previewUrl = URL.createObjectURL(rawFile)
          } else if (typeof rawFile === 'string') {
            previewUrl = rawFile
          }

          const isVideo = isFileObj
            ? rawFile.type.startsWith('video/')
            : typeof previewUrl === 'string' &&
              (previewUrl.startsWith('data:video/') ||
                Boolean(previewUrl.match(/\.(mp4|webm|ogg)$/i)))

          const isPrimary = showPrimaryControl && field.isPrimary

          return (
            <div
              key={field.id}
              className={cn(
                'bg-muted/20 relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden border border-dashed p-1.5',
                isPrimary ? 'border-primary' : 'border-border',
              )}
            >
              <div className="group relative size-full">
                {isVideo ? (
                  <video
                    src={previewUrl}
                    className="size-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="product"
                    className="size-full object-cover"
                  />
                )}
                <div className="dark absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-100 transition-opacity">
                  {showPrimaryControl && !isVideo && !isPrimary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      className="size-8"
                      onClick={() => handleSetPrimary(index)}
                      title="ตั้งเป็นรูปหลัก"
                    >
                      <Star className="size-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="size-8"
                    onClick={() => handleRemoveImage(index)}
                    title="ลบรูปภาพ"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
        <label className="bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed">
          <ImagePlus className="size-5" />
          <span className="mt-2 text-xs font-medium">เพิ่มสื่อ</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </FieldSet>
  )
}
