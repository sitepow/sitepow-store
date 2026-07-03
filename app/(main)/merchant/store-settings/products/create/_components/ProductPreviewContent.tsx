import { useFormContext, useWatch } from 'react-hook-form'

import { useStoreFilter } from '@/stores/use-store-filter'
import { arrayToString, stringToArray } from '@/utils/format'

export function ProductPreviewContent() {
  const { control } = useFormContext()
  const { selectedStoreSlug } = useStoreFilter()

  const [title, slug, tags, variants] = useWatch({
    control,
    name: ['title', 'slug', 'tags', 'variants'],
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
          <p className="cursor-pointer text-xl text-purple-900 hover:underline">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm opacity-60">{description}</p>
        </div>
      </div>

      <div className="dark:bg-foreground/5 overflow-hidden rounded-lg border">
        <p className="border-b p-3 text-xs font-semibold uppercase opacity-40">
          Social Share (ตัวอย่าง)
        </p>
        <div className="bg-foreground/20 flex aspect-video items-center justify-center opacity-40">
          รูปภาพตัวอย่าง
        </div>
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
