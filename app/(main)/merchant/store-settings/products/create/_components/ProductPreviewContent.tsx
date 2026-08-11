import { useFormContext, useWatch } from 'react-hook-form'

import Image from 'next/image'

import { FALLBACK_IMAGE } from '@/constants/system'
import { useStoreFilter } from '@/stores/use-store-filter'
import { arrayToString, stringToArray } from '@/utils/format'

export function ProductPreviewContent() {
  const { control } = useFormContext()
  const { selectedStoreSlug } = useStoreFilter()

  const [title, slug, tags, variants, images] = useWatch({
    control,
    name: ['title', 'slug', 'tags', 'variants', 'images'],
  })

  const displayTitle = title || 'ชื่อสินค้าจะแสดงตรงนี้'
  const displaySlug = slug || 'url-slug-example'
  const formattedTags = arrayToString(stringToArray(tags))

  const getMinPrice = () => {
    if (!variants || variants.length === 0) {
      return null
    }

    const prices = variants
      .map((v: { price: number }) => Number(v?.price))
      .filter((p: number) => !isNaN(p) && p > 0)

    if (prices.length === 0) {
      return null
    }
    return Math.min(...prices)
  }

  const getPreviewImageUrl = () => {
    if (!images || images.length === 0) {
      return FALLBACK_IMAGE
    }

    const primaryImg = images.find(
      (img: { isPrimary?: boolean }) => img?.isPrimary,
    )
    const targetImg = primaryImg || images[0]
    const rawUrl = targetImg?.url

    if (!rawUrl) {
      return FALLBACK_IMAGE
    }

    if (rawUrl instanceof File) {
      return URL.createObjectURL(rawUrl)
    }

    return typeof rawUrl === 'string' ? rawUrl : FALLBACK_IMAGE
  }

  const previewImageUrl = getPreviewImageUrl()

  const minPrice = getMinPrice()

  const priceText =
    minPrice !== null ? ` เริ่มต้นเพียง ฿${minPrice.toLocaleString()}! ` : ' '
  const description = `${formattedTags ? `${formattedTags}` : ''}ช้อปเลย! ${title || 'สินค้าคุณภาพ'}${priceText}พร้อมโปรโมชั่นพิเศษและตัวเลือกเสริมมากมาย การันตีของแท้ สั่งซื้อได้ที่นี่...`

  return (
    <div className="text-foreground space-y-6">
      <div className="dark:bg-foreground/5 rounded-lg border p-4">
        <p className="mb-2 text-xs font-semibold uppercase opacity-60">
          Google Search (ตัวอย่าง)
        </p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-700">
            https://{selectedStoreSlug}.sitepow.store › products › {displaySlug}
          </p>
          <p className="cursor-pointer text-xl text-purple-600 hover:underline">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm opacity-60">{description}</p>
        </div>
      </div>
      <div className="dark:bg-foreground/5 overflow-hidden rounded-lg border">
        <p className="border-b p-3 text-xs font-semibold uppercase opacity-40">
          Social Share (ตัวอย่าง)
        </p>
        <Image
          src={previewImageUrl}
          className="h-96 w-full object-cover object-center"
          width={800}
          height={800}
          alt="preview-image"
          unoptimized={previewImageUrl.startsWith('blob:')}
        />
        <div className="p-3">
          <p className="text-[12px] text-emerald-700 uppercase">
            https://{selectedStoreSlug}.sitepow.store
          </p>
          <p className="font-bold">{displayTitle}</p>
          <p className="line-clamp-1 text-sm opacity-60">{description}</p>
        </div>
      </div>
    </div>
  )
}
