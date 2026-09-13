import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { getStorefrontBlogDetail } from '@/actions/storefront/blog'
import { getLocalizedField } from '@/utils/intl'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { BlogHeader } from '../_components/BlogHeader'
import { BlogTags } from '../_components/BlogTags'

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

export default async function StoreBlogDescriptionPage({ params }: Props) {
  const { domain, slug } = await params
  const blog = await getStorefrontBlogDetail(domain, slug)

  if (!blog) {
    notFound()
  }

  const locale = await getLocale()
  const localizedTitle = getLocalizedField(blog, 'title', locale) || blog.title
  const localizedContent =
    getLocalizedField(blog, 'content', locale) || blog.content

  const readingTime = Math.ceil(localizedContent.length / 500) || 5

  return (
    <StoreLayout>
      <SectionContainer>
        <BlogHeader createdAt={blog.createdAt} readingTime={readingTime} />
        <div className="mx-auto max-w-3xl py-8 text-start">
          <h1 className="mb-6 text-3xl font-bold">{localizedTitle}</h1>
          {localizedContent && <MarkdownRenderer content={localizedContent} />}
          <BlogTags tags={blog.tags} />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
