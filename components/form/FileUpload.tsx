/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client'

import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

import { FALLBACK_IMAGE } from '@/constants/system'
import { IconCamera, IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function FileUpload({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const { setValue, watch } = useFormContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileValue = watch(name)

  const isVideo =
    (fileValue instanceof File && fileValue.type.startsWith('video/')) ||
    (typeof fileValue === 'string' && fileValue.match(/\.(mp4|webm|ogg)$/i))

  const previewUrl =
    fileValue instanceof File ? URL.createObjectURL(fileValue) : fileValue

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div
      className={cn(
        'relative flex size-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed',
        className,
      )}
    >
      {previewUrl ? (
        <div className="relative size-full">
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
              className="size-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE
              }}
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute top-1.5 right-1.5 size-6 rounded-full shadow-xs"
            onClick={() => setValue(name, '')}
            aria-label="ลบรูปภาพ"
          >
            <IconX size={12} aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconCamera size={24} />
        </Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setValue(name, file)
        }}
      />
    </div>
  )
}
