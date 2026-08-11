/* eslint-disable @next/next/no-img-element */
'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'
import { ImagePlus, Star, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'

import { cn } from '@/lib/utils'

export function ImageUploadSection() {
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
        isPrimary: isFirstImage,
      })
    }
  }

  const handleSetPrimary = (targetIndex: number) => {
    const currentImages = getValues('images') || []
    const updated = currentImages.map((img, idx) => ({
      ...img,
      isPrimary: idx === targetIndex,
    }))
    setValue('images', updated, { shouldDirty: true })
  }

  const handleRemoveImage = (index: number) => {
    const currentImages = getValues('images') || []
    const isRemovingPrimary = currentImages[index]?.isPrimary

    remove(index)

    if (isRemovingPrimary && currentImages.length > 1) {
      const remainingImages = currentImages.filter((_, idx) => idx !== index)
      if (remainingImages.length > 0) {
        remainingImages[0].isPrimary = true
        setValue('images', remainingImages, { shouldDirty: true })
      }
    }
  }

  return (
    <FieldSet className="space-y-4">
      <FieldLegend variant="label" className="text-lg font-bold">
        สื่อสินค้า ({fields.length})
      </FieldLegend>
      <FieldDescription>
        รองรับรูปภาพและวิดีโอ (ขนาดไฟล์สูงสุด 10 MB)
      </FieldDescription>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {fields.map((field, index) => {
          const file = field.url
          const isFileObj = file instanceof File
          const previewUrl = isFileObj
            ? URL.createObjectURL(file as File)
            : (file as string)
          const isVideo = isFileObj
            ? (file as File).type.startsWith('video/')
            : previewUrl.match(/\.(mp4|webm|ogg)$/i)

          const isPrimary = field.isPrimary

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
                  {!isVideo && !isPrimary && (
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
