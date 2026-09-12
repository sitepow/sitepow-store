'use client'

import { useTranslations } from 'next-intl'

import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { PlayCircleIcon, TagIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

const metadataLabelMap = PRODUCT_METADATA_MASTER.reduce<Record<string, string>>(
  (acc, category) => {
    category.fields.forEach(({ key, label }) => {
      acc[key] = label
    })
    return acc
  },
  {},
)

export function ProductSpecification() {
  const t = useTranslations('storefront.products')
  const product = useProductPurchaseStore((s) => s.product)
  const isLoading = useProductPurchaseStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-px flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 border-b pb-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-36 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const details = product.details as Record<string, unknown> | null
  const videoUrl =
    typeof details?.videoUrl === 'string' && details.videoUrl.trim()
      ? details.videoUrl.trim()
      : null
  const description =
    typeof details?.description === 'string' && details.description.trim()
      ? details.description.trim()
      : null
  const specEntries = Object.entries(details || {}).filter(
    ([key]) =>
      key !== 'affiliateLinks' && key !== 'videoUrl' && key !== 'description',
  )
  const tags = product.tags ?? []

  const hasSpecs = specEntries.length > 0
  const hasTags = tags.length > 0
  const hasVideo = !!videoUrl
  const hasDescription = !!description

  if (!hasSpecs && !hasTags && !hasVideo && !hasDescription) {
    return null
  }

  return (
    <div className="space-y-6">
      {hasDescription && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('productDetails')}</h3>
            <Separator className="flex-1" />
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {description}
          </div>
        </>
      )}
      {hasSpecs && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('specifications')}</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col border-b pb-2">
                <span className="text-sm">
                  {metadataLabelMap[key] ?? key.replace(/_/g, ' ')}
                </span>
                <span className="text-primary text-sm">
                  {Array.isArray(value)
                    ? value
                        .map((v) =>
                          typeof v === 'object' && v !== null
                            ? `${v.label}: ${v.value}`
                            : String(v),
                        )
                        .join(', ')
                    : String(value ?? '')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {hasVideo && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <PlayCircleIcon className="text-primary h-5 w-5" />
              {t('productVideo')}
            </h3>
            <Separator className="flex-1" />
          </div>
          <div className="bg-muted/30 overflow-hidden rounded-xl border p-2 sm:p-4">
            {videoUrl.includes('tiktok.com/embed') ? (
              <iframe
                src={videoUrl}
                className="mx-auto aspect-[9/16] w-full max-w-sm rounded-lg border"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : videoUrl.includes('.mp4') ||
              videoUrl.includes('.webm') ||
              videoUrl.includes('r2.dev') ||
              videoUrl.includes('cloudflare') ? (
              <video
                src={videoUrl}
                controls
                playsInline
                className="mx-auto aspect-video max-h-[480px] w-full max-w-3xl rounded-lg bg-black/90 object-contain shadow-sm"
              />
            ) : (
              <div className="flex items-center justify-center p-4">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  <PlayCircleIcon className="h-4 w-4" />
                  {videoUrl}
                </a>
              </div>
            )}
          </div>
        </>
      )}
      {hasTags && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('tags')}</h3>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.name} variant="outline" className="font-normal">
                <TagIcon /> {tag.name}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
