'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { useCurrentStore } from '@/hooks/use-current-store'
import { FALLBACK_IMAGE } from '@/constants/system'
import { useStoreFilter } from '@/stores/use-store-filter'
import { arrayToString, stringToArray } from '@/utils/format'

export function BlogPreviewContent() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.blog.preview')
  const { control } = useFormContext()
  const { selectedStoreSlug } = useStoreFilter()

  const [title, slug, tags, image, content] = useWatch({
    control,
    name: ['title', 'slug', 'tags', 'image', 'content'],
  })

  const displayTitle = title || t('titlePlaceholder')
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
  const contentSnippet = cleanContent || t('contentPlaceholder')
  const description = `${tagText}${contentSnippet}`

  return (
    <div
      className="text-foreground space-y-6"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <div className="dark:bg-foreground/5 rounded-lg border p-4">
        <p className="mb-2 text-xs font-semibold uppercase opacity-60">
          {t('googleSearch')}
        </p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-700">
            https://{selectedStoreSlug}.sitepow.store › blogs › {displaySlug}
          </p>
          <p className="cursor-pointer text-xl text-purple-600 hover:underline">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm opacity-60">{description}</p>
        </div>
      </div>
      <div className="dark:bg-foreground/5 overflow-hidden rounded-lg border">
        <p className="border-b p-3 text-xs font-semibold uppercase opacity-40">
          {t('socialShare')}
        </p>
        <Image
          src={coverImage}
          className="h-96 w-full object-cover object-center"
          width={800}
          height={800}
          alt="preview-image"
          unoptimized={image instanceof File}
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
