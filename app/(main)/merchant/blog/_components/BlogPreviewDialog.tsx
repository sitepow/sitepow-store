'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import Image from 'next/image'

import { FALLBACK_IMAGE } from '@/constants/system'
import { useStoreFilter } from '@/stores/use-store-filter'
import { arrayToString, stringToArray } from '@/utils/format'

export function BlogPreviewContent() {
  const { control } = useFormContext()
  const { selectedStoreSlug } = useStoreFilter()

  const [title, slug, tags, image, content] = useWatch({
    control,
    name: ['title', 'slug', 'tags', 'image', 'content'],
  })

  const displayTitle = title || 'หัวข้อบทความจะแสดงตรงนี้'
  const displaySlug = slug || 'blog-post-slug-example'
  const formattedTags = arrayToString(stringToArray(tags))

  const previewImageUrl = useMemo(() => {
    if (!image) return FALLBACK_IMAGE
    if (image instanceof File) {
      return URL.createObjectURL(image)
    }
    return typeof image === 'string' && image !== '' ? image : FALLBACK_IMAGE
  }, [image])

  const description = useMemo(() => {
    if (!content) {
      return 'อ่านบทความน่าสนใจ และอัปเดตสาระดีๆ ได้ที่บล็อกของเรา...'
    }

    const cleanText = content
      .replace(/<[^>]*>/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[#*`_~>|\-[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return (
      cleanText.slice(0, 150) ||
      'อ่านบทความน่าสนใจ และอัปเดตสาระดีๆ ได้ที่บล็อกของเรา...'
    )
  }, [content])

  return (
    <div className="text-foreground space-y-6">
      <div className="dark:bg-foreground/5 rounded-lg border p-4">
        <p className="mb-2 text-xs font-semibold uppercase opacity-60">
          Google Search (ตัวอย่างการแสดงผลบน Search Engine)
        </p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-700">
            https://{selectedStoreSlug || 'your-store'}.sitepow.store › blogs ›{' '}
            {displaySlug}
          </p>
          <p className="cursor-pointer text-xl text-purple-600 hover:underline">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm opacity-60">{description}</p>
        </div>
      </div>
      <div className="dark:bg-foreground/5 overflow-hidden rounded-lg border">
        <p className="border-b p-3 text-xs font-semibold uppercase opacity-40">
          Social Share (ตัวอย่างการแชร์ลง Facebook / LINE / Twitter)
        </p>
        <div className="bg-muted relative h-64 w-full">
          <Image
            src={previewImageUrl}
            className="h-full w-full object-cover object-center"
            width={800}
            height={420}
            alt="blog-cover-preview"
            unoptimized={image instanceof File}
          />
        </div>
        <div className="p-3">
          <p className="text-[12px] text-emerald-700 uppercase">
            {selectedStoreSlug || 'your-store'}.sitepow.store
          </p>
          <p className="font-bold">{displayTitle}</p>
          <p className="line-clamp-2 text-sm opacity-60">{description}</p>
          {formattedTags && (
            <p className="text-muted-foreground mt-2 text-xs">
              แท็ก: {formattedTags}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
