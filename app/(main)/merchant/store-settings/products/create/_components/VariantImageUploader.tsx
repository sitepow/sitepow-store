'use client'

/* eslint-disable @next/next/no-img-element */
import { ImagePlus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VariantImageUploaderProps {
  previewUrl: string | null
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
}

export function VariantImageUploader({
  previewUrl,
  onImageChange,
  onRemoveImage,
}: VariantImageUploaderProps) {
  const t = useTranslations('merchant.products.form')

  return (
    <div className="flex items-center justify-center sm:col-span-3">
      <div
        className={cn(
          'bg-muted/20 hover:bg-muted/40 relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden border border-dashed p-1.5',
          previewUrl ? 'border-primary' : 'border-border',
        )}
      >
        {previewUrl ? (
          <div className="group relative size-full">
            <img
              src={previewUrl}
              alt="Variant thumbnail"
              className="size-full object-cover"
            />
            <div className="dark absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition-opacity">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="size-8"
                onClick={onRemoveImage}
                title={t('deleteImage')}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label className="text-muted-foreground hover:text-foreground flex size-full cursor-pointer flex-col items-center justify-center transition-colors">
            <ImagePlus className="size-5" />
            <span className="mt-2 text-xs font-medium">
              {t('addVariantImage')}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}
