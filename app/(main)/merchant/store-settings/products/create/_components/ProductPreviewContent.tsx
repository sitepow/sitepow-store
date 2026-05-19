import { useFormContext, useWatch } from 'react-hook-form'

import { arrayToString, stringToArray } from '@/utils/format'

export function ProductPreviewContent() {
  const { control } = useFormContext()

  const [title, slug, tags] = useWatch({
    control,
    name: ['title', 'slug', 'tags'],
  })

  const displayTitle = title || 'ชื่อสินค้าจะแสดงตรงนี้'
  const displaySlug = slug || 'url-slug-example'
  const formattedTags = arrayToString(stringToArray(tags))

  const description = `${formattedTags}สั่งซื้อ ${title} พร้อมโปรโมชั่นพิเศษและตัวเลือกเสริมมากมายได้ที่นี่...`

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">
          Google Search (ตัวอย่าง)
        </p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-700">
            https://yourstore.com › products › {displaySlug}
          </p>
          <p className="cursor-pointer text-xl text-blue-700 hover:underline">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <p className="border-b p-3 text-xs font-semibold text-slate-400 uppercase">
          Social Share (ตัวอย่าง)
        </p>
        <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-400">
          รูปภาพตัวอย่าง
        </div>
        <div className="bg-[#f2f3f5] p-3">
          <p className="text-[12px] text-slate-500 uppercase">YOURSTORE.COM</p>
          <p className="font-bold text-slate-800">{displayTitle}</p>
          <p className="line-clamp-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  )
}
