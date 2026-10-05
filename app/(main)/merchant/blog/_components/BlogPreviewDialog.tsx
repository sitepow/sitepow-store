'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import Image from 'next/image'

import { FALLBACK_IMAGE } from '@/constants/system'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { arrayToString, stringToArray } from '@/utils/formatting/text'

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

  const coverImage = useMemo(() => {
    if (!image) return FALLBACK_IMAGE
    if (image instanceof File) {
      return URL.createObjectURL(image)
    }
    if (Array.isArray(image) && image.length > 0) {
      return image[0]?.url || image[0] || FALLBACK_IMAGE
    }
    return typeof image === 'string' && image !== '' ? image : FALLBACK_IMAGE
  }, [image])

  const cleanContent = useMemo(() => {
    if (!content) return ''
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[#*`_~>|\-[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }, [content])

  const tagText = formattedTags ? `[${formattedTags}] ` : ''
  const contentSnippet =
    cleanContent || 'อ่านบทความน่าสนใจ และอัปเดตสาระดีๆ ได้ที่บล็อกของเรา...'
  const description = `${tagText}${contentSnippet}`

  return (
    <div className="text-foreground space-y-6">
      <div className="bg-card text-card-foreground rounded-xl border border-border p-4 shadow-xs">
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Google Search (ตัวอย่าง)
        </p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-600 dark:text-emerald-400  text-xs">
            https://{selectedStoreSlug}.sitepow.store › blogs › {displaySlug}
          </p>
          <p className="cursor-pointer text-xl text-primary font-semibold hover:underline">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="bg-card text-card-foreground overflow-hidden rounded-xl border border-border shadow-xs">
        <p className="border-b border-border p-3 text-xs font-semibold uppercase text-muted-foreground">
          Social Share (ตัวอย่าง)
        </p>
        <Image
          src={coverImage}
          className="h-96 w-full object-cover object-center"
          width={800}
          height={800}
          alt="preview-image"
          unoptimized={image instanceof File}
        />
        <div className="p-4 space-y-1">
          <p className="text-[12px] text-emerald-600 dark:text-emerald-400  uppercase">
            https://{selectedStoreSlug}.sitepow.store
          </p>
          <p className="font-bold text-foreground text-base">{displayTitle}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
