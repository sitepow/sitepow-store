/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

import { FALLBACK_IMAGE } from '@/constants/system'
import { IconCamera, IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function ImageUpload({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const { setValue, watch } = useFormContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const image = watch(name)

  const previewUrl = image instanceof File ? URL.createObjectURL(image) : image

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
          <img
            src={previewUrl}
            className="size-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE
            }}
          />
          <button
            type="button"
            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
            onClick={() => setValue(name, '')}
          >
            <IconX size={14} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconCamera size={24} />
        </Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setValue(name, file)
        }}
      />
    </div>
  )
}
