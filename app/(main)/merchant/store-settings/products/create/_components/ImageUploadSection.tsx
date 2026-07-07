/* eslint-disable @next/next/no-img-element */
'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'
import { ImagePlus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'

export function ImageUploadSection() {
  const { control } = useFormContext<ProductFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images',
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      return
    }

    for (let i = 0; i < files.length; i++) {
      append({ url: files[i] })
    }
  }

  return (
    <FieldSet className="space-y-4">
      <FieldLegend variant="label" className="text-lg font-bold">
        สื่อสินค้า ({fields.length})
      </FieldLegend>
      <FieldDescription>
        รองรับรูปภาพและวิดีโอ (รองรับขนาดไฟล์สูงสุด 10 MB)
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

          return (
            <div
              key={field.id}
              className="group bg-muted/10 relative aspect-square overflow-hidden rounded-md border"
            >
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="product"
                  className="h-full w-full object-cover"
                />
              )}

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                onClick={() => remove(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          )
        })}

        <label className="bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors">
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
