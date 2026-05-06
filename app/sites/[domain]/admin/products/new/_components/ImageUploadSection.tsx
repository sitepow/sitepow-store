/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'
import { ImagePlus, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldLegend, FieldSet } from '@/components/ui/field'

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
    <FieldSet className="bg-muted/30 rounded-xl border p-6">
      <FieldLegend className="text-lg font-bold">
        รูปภาพสินค้า ({fields.length})
      </FieldLegend>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group bg-background relative aspect-square overflow-hidden rounded-lg border"
          >
            <img
              src={field.url}
              alt="product"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 opacity-100 transition-opacity group-hover:opacity-100 xl:opacity-0"
              onClick={() => remove(index)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        <label
          className={cn(
            'border-muted-foreground/25 hover:bg-muted/50 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            isUploading && 'pointer-events-none opacity-50',
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="text-muted-foreground mb-3 size-8 animate-spin" />
            ) : (
              <ImagePlus className="text-muted-foreground mb-3 size-8" />
            )}
            <p className="text-muted-foreground text-xs">
              {isUploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่อเพิ่มรูป'}
            </p>
          </div>
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
