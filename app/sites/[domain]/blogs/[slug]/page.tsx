import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { getStore } from '@/actions/store'
import { getStorefrontBlogDetail } from '@/actions/storefront/blog'
import { getLocalizedField } from '@/utils/intl'
import {
  buildRobots,
  cleanDescription,
  generateBlogJsonLd,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { BlogHeader } from '../_components/BlogHeader'
import { BlogTags } from '../_components/BlogTags'

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  const [blog, store] = await Promise.all([
    getStorefrontBlogDetail(domain, slug),
    getStore({ domain }),
  ])

  if (!blog || !store) {
    return {}
  }

  const locale = await getLocale()
  const blogTitle = getLocalizedField(blog, 'title', locale) || blog.title
  const blogContent = getLocalizedField(blog, 'content', locale) || blog.content
  const description = cleanDescription(blogContent, 160) || blogTitle
  const url = getStoreUrl(store, domain)
  const blogUrl = `${url}/blogs/${blog.slug}`
  const previewImage = getStorePreviewImage(store, blog.image, url)

  return {
    title: blogTitle,
    description,
    keywords: blog.tags,
    alternates: {
      canonical: blogUrl,
    },
    openGraph: {
      title: `${blogTitle} | ${store.name}`,
      description,
      url: blogUrl,
      siteName: store.name,
      locale: 'th_TH',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: blogTitle,
        },
      ],
      type: 'article',
      publishedTime: blog.createdAt
        ? new Date(blog.createdAt).toISOString()
        : undefined,
      authors: [store.name],
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blogTitle} | ${store.name}`,
      description,
      images: [previewImage],
    },
    robots: buildRobots(store),
  }
}

export default async function StoreBlogDescriptionPage({ params }: Props) {
  const { domain, slug } = await params
  const [blog, store] = await Promise.all([
    getStorefrontBlogDetail(domain, slug),
    getStore({ domain }),
  ])

  if (!blog) {
    notFound()
  }

  const locale = await getLocale()
  const localizedTitle = getLocalizedField(blog, 'title', locale) || blog.title
  const localizedContent =
    getLocalizedField(blog, 'content', locale) || blog.content

  const readingTime = Math.ceil(localizedContent.length / 500) || 5

  const url = getStoreUrl(store, domain)
  const blogUrl = `${url}/blogs/${slug}`
  const previewImage = getStorePreviewImage(store, blog.image, url)
  const blogJsonLd = store
    ? generateBlogJsonLd(blog, store, blogUrl, previewImage)
    : null

  return (
    <StoreLayout>
      {blogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      )}
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
