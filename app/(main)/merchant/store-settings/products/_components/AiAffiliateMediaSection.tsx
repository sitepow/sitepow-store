'use client'

import { useTranslations } from 'next-intl'
import {
  IconExternalLink,
  IconPhoto,
  IconPlus,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react'
import { ImagePlus, Star, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AiAffiliateMediaSectionProps {
  images: string[]
  primaryImageIndex: number
  videoUrl: string
  newImageUrl: string
  isAddingImageUrl: boolean
  isUploadingImage: boolean
  isUploadingVideo: boolean
  imageFileInputRef: React.RefObject<HTMLInputElement | null>
  videoFileInputRef: React.RefObject<HTMLInputElement | null>
  onSetPrimary: (index: number) => void
  onRemoveImage: (index: number) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddImageUrl: () => void
  onToggleAddImageUrl: () => void
  onNewImageUrlChange: (val: string) => void
  onVideoUrlChange: (val: string) => void
}

export function AiAffiliateMediaSection({
  images,
  primaryImageIndex,
  videoUrl,
  newImageUrl,
  isAddingImageUrl,
  isUploadingImage,
  isUploadingVideo,
  imageFileInputRef,
  videoFileInputRef,
  onSetPrimary,
  onRemoveImage,
  onImageUpload,
  onVideoUpload,
  onAddImageUrl,
  onToggleAddImageUrl,
  onNewImageUrlChange,
  onVideoUrlChange,
}: AiAffiliateMediaSectionProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')

  return (
    <div className="space-y-4 rounded-xl border p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <IconPhoto className="text-primary h-4 w-4" />
          <span>{t('imagesTitle', { count: images.length })}</span>
        </h4>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="file"
            ref={imageFileInputRef}
            onChange={onImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imageFileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="h-7 px-2 text-xs sm:px-3"
          >
            <IconUpload className="mr-1 h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('uploadImageBtn')}</span>
            <span className="sm:hidden">อัปโหลด</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleAddImageUrl}
            className="h-7 px-2 text-xs sm:px-3"
          >
            <IconPlus className="mr-1 h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('addImageUrlBtn')}</span>
            <span className="sm:hidden">ใส่ลิงก์</span>
          </Button>
        </div>
      </div>

      {isAddingImageUrl && (
        <div className="flex items-center gap-2">
          <Input
            type="url"
            placeholder="https://... (URL รูปภาพ)"
            value={newImageUrl}
            onChange={(e) => onNewImageUrlChange(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddImageUrl()
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={onAddImageUrl}
            className="h-8 shrink-0 text-xs"
          >
            เพิ่ม
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, index) => {
          const isPrimary = index === primaryImageIndex

          return (
            <div
              key={index}
              className={cn(
                'bg-muted/20 relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden border border-dashed p-1.5',
                isPrimary ? 'border-primary' : 'border-border',
              )}
            >
              <div className="group relative size-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`product-${index}`}
                  className="size-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
                {isPrimary && (
                  <div className="pointer-events-none absolute top-1.5 left-1.5 z-10">
                    <span className="bg-primary flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                      <Star className="size-3 fill-white" />
                      {t('primaryBadge')}
                    </span>
                  </div>
                )}
                <div className="dark absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-100 transition-opacity">
                  {!isPrimary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      className="size-8"
                      onClick={() => onSetPrimary(index)}
                      title={t('setPrimaryImage') || 'ตั้งเป็นรูปหลัก'}
                    >
                      <Star className="size-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="size-8"
                    onClick={() => onRemoveImage(index)}
                    title={t('deleteImage') || 'ลบรูปภาพ'}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
        <label className="bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed transition-colors">
          <ImagePlus className="size-5" />
          <span className="mt-2 text-xs font-medium">
            {t('uploadImageBtn')}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
          />
        </label>
      </div>

      {/* Video section */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <FieldLabel className="flex items-center gap-1.5 text-xs sm:text-sm">
            <IconVideo className="text-primary h-4 w-4" />
            <span>{t('videoTitle')}</span>
          </FieldLabel>
          <div>
            <input
              type="file"
              ref={videoFileInputRef}
              onChange={onVideoUpload}
              accept="video/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => videoFileInputRef.current?.click()}
              disabled={isUploadingVideo}
              className="h-7 px-2 text-xs sm:px-3"
            >
              <IconUpload className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {t('uploadVideoBtn')}
              </span>
              <span className="sm:hidden">อัปโหลดวิดีโอ</span>
            </Button>
          </div>
        </div>

        <Input
          type="url"
          placeholder={t('videoPlaceholder')}
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          className="text-xs"
        />

        {videoUrl && (
          <div className="mt-2 overflow-hidden rounded-lg border bg-black">
            {videoUrl.includes('.mp4') ||
            videoUrl.includes('.webm') ||
            videoUrl.includes('r2.dev') ||
            videoUrl.includes('cloudflare') ? (
              <video
                src={videoUrl}
                controls
                className="max-h-56 w-full object-contain"
              />
            ) : videoUrl.includes('tiktok.com/embed') ? (
              <iframe
                src={videoUrl}
                className="h-56 w-full border-0"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-between p-3 text-xs text-white">
                <span className="truncate">{videoUrl}</span>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1 underline"
                >
                  <span>เปิดดูวิดีโอ</span>
                  <IconExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
