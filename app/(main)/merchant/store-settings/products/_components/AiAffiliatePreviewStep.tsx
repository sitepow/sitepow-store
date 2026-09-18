'use client'

import {
  IconPhoto,
  IconPlayerPlay,
  IconVideo,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  AFFILIATE_PLATFORM_CONFIG,
  AffiliatePlatform,
} from '@/types/affiliate-product'

import { AiAffiliateDetailsSection } from './AiAffiliateDetailsSection'
import { AiAffiliateMediaSection } from './AiAffiliateMediaSection'
import { AiAffiliatePricingSection } from './AiAffiliatePricingSection'

interface CategoryOption {
  id: string
  title: string
}

interface AiAffiliatePreviewStepProps {
  title: string
  slug: string
  price: number
  originalPrice: number
  platform: AffiliatePlatform
  platformLabel: string
  isOnSale: boolean
  discountText: string
  images: string[]
  primaryImageIndex: number
  videoUrl: string
  tags: string
  description: string
  specs: { key: string; value: string }[]
  destinationUrl: string
  newImageUrl: string
  isAddingImageUrl: boolean
  isUploadingImage: boolean
  isUploadingVideo: boolean
  categories: CategoryOption[]
  selectedCategoryId: string
  imageFileInputRef: React.RefObject<HTMLInputElement | null>
  videoFileInputRef: React.RefObject<HTMLInputElement | null>
  onTitleChange: (val: string) => void
  onSlugChange: (val: string) => void
  onPriceChange: (val: number) => void
  onOriginalPriceChange: (val: number) => void
  onPlatformChange: (val: AffiliatePlatform) => void
  onPlatformLabelChange: (val: string) => void
  onIsOnSaleChange: (val: boolean) => void
  onDiscountTextChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onDestinationUrlChange: (val: string) => void
  onTagsChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onSetPrimary: (index: number) => void
  onRemoveImage: (index: number) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddImageUrl: () => void
  onToggleAddImageUrl: () => void
  onNewImageUrlChange: (val: string) => void
  onVideoUrlChange: (val: string) => void
  onAddSpec: () => void
  onRemoveSpec: (idx: number) => void
  onUpdateSpec: (idx: number, field: 'key' | 'value', val: string) => void
}

export function AiAffiliatePreviewStep({
  title,
  slug,
  price,
  originalPrice,
  platform,
  platformLabel,
  isOnSale,
  discountText,
  images,
  primaryImageIndex,
  videoUrl,
  tags,
  description,
  specs,
  destinationUrl,
  newImageUrl,
  isAddingImageUrl,
  isUploadingImage,
  isUploadingVideo,
  categories,
  selectedCategoryId,
  imageFileInputRef,
  videoFileInputRef,
  onTitleChange,
  onSlugChange,
  onPriceChange,
  onOriginalPriceChange,
  onPlatformChange,
  onPlatformLabelChange,
  onIsOnSaleChange,
  onDiscountTextChange,
  onCategoryChange,
  onDestinationUrlChange,
  onTagsChange,
  onDescriptionChange,
  onSetPrimary,
  onRemoveImage,
  onImageUpload,
  onVideoUpload,
  onAddImageUrl,
  onToggleAddImageUrl,
  onNewImageUrlChange,
  onVideoUrlChange,
  onAddSpec,
  onRemoveSpec,
  onUpdateSpec,
}: AiAffiliatePreviewStepProps) {
  const platformCfg =
    AFFILIATE_PLATFORM_CONFIG[platform] || AFFILIATE_PLATFORM_CONFIG.OTHER
  const primaryImageSrc = images[primaryImageIndex] || images[0] || ''

  return (
    <div className="space-y-6">
      {/* Product Visual Card Preview */}
      <div className="bg-muted/20 flex flex-row items-start gap-3 rounded-xl border p-3 sm:items-center sm:gap-4 sm:p-4">
        <div className="bg-background relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border sm:h-28 sm:w-28">
          {primaryImageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImageSrc}
              alt={title}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          ) : (
            <IconPhoto className="text-muted-foreground/50 h-8 w-8" />
          )}
          {videoUrl && (
            <span className="absolute right-1 bottom-1 rounded-full bg-black/70 p-1 text-white">
              <IconPlayerPlay className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${platformCfg.badgeClass}`}
            >
              {platformCfg.name}
            </span>
            {isOnSale && (
              <Badge
                variant="destructive"
                className="px-1.5 py-0 text-[10px] sm:text-xs"
              >
                {discountText || 'ลดราคา'}
              </Badge>
            )}
            {videoUrl && (
              <Badge
                variant="secondary"
                className="gap-1 px-1.5 py-0 text-[10px] sm:text-xs"
              >
                <IconVideo className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                มีวิดีโอ
              </Badge>
            )}
          </div>

          <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-medium sm:text-base">
            {title || 'ชื่อสินค้า'}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-primary text-base font-bold sm:text-lg">
              ฿{Number(price).toLocaleString()}
            </span>
            {isOnSale && originalPrice > price && (
              <span className="text-muted-foreground text-xs line-through">
                ฿{Number(originalPrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <AiAffiliateMediaSection
        images={images}
        primaryImageIndex={primaryImageIndex}
        videoUrl={videoUrl}
        newImageUrl={newImageUrl}
        isAddingImageUrl={isAddingImageUrl}
        isUploadingImage={isUploadingImage}
        isUploadingVideo={isUploadingVideo}
        imageFileInputRef={imageFileInputRef}
        videoFileInputRef={videoFileInputRef}
        onSetPrimary={onSetPrimary}
        onRemoveImage={onRemoveImage}
        onImageUpload={onImageUpload}
        onVideoUpload={onVideoUpload}
        onAddImageUrl={onAddImageUrl}
        onToggleAddImageUrl={onToggleAddImageUrl}
        onNewImageUrlChange={onNewImageUrlChange}
        onVideoUrlChange={onVideoUrlChange}
      />

      <AiAffiliatePricingSection
        price={price}
        originalPrice={originalPrice}
        platform={platform}
        platformLabel={platformLabel}
        isOnSale={isOnSale}
        discountText={discountText}
        onPriceChange={onPriceChange}
        onOriginalPriceChange={onOriginalPriceChange}
        onPlatformChange={onPlatformChange}
        onPlatformLabelChange={onPlatformLabelChange}
        onIsOnSaleChange={onIsOnSaleChange}
        onDiscountTextChange={onDiscountTextChange}
      />

      <AiAffiliateDetailsSection
        title={title}
        slug={slug}
        selectedCategoryId={selectedCategoryId}
        destinationUrl={destinationUrl}
        tags={tags}
        description={description}
        specs={specs}
        categories={categories}
        onTitleChange={onTitleChange}
        onSlugChange={onSlugChange}
        onCategoryChange={onCategoryChange}
        onDestinationUrlChange={onDestinationUrlChange}
        onTagsChange={onTagsChange}
        onDescriptionChange={onDescriptionChange}
        onAddSpec={onAddSpec}
        onRemoveSpec={onRemoveSpec}
        onUpdateSpec={onUpdateSpec}
      />
    </div>
  )
}
