/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'
import { ImagePlus, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'

import { cn } from '@/lib/utils'

export function ImageUploadSection() {
  const { control } = useFormContext<ProductFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images',
  })

  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      return
    }

    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const fakeUrl = URL.createObjectURL(files[i])
        append({ url: fakeUrl })
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FieldSet className="space-y-4">
      <FieldLegend variant="label" className="text-lg font-bold">
        รูปภาพสินค้า ({fields.length})
      </FieldLegend>
      <FieldDescription>
        แสดงในหน้าหน้าร้านค้า แนะนำสัดส่วน 1:1
      </FieldDescription>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group bg-muted/10 relative aspect-square overflow-hidden rounded-md border"
          >
            <img
              src={field.url}
              alt="product"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 absolute top-1.5 right-1.5 h-6 w-6 rounded-md border opacity-100 shadow-sm backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
              onClick={() => remove(index)}
            >
              <X className="text-muted-foreground" />
            </Button>
          </div>
        ))}
        <label
          className={cn(
            'bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors',
            isUploading && 'pointer-events-none opacity-50',
          )}
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="mt-2 text-xs font-medium">
            {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </FieldSet>
  )
}
