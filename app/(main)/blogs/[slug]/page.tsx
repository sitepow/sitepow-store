import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { getStaticBlogBySlug, getStaticBlogs } from '@/constants/blogs'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { BlogDetailArticle } from './_components/BlogDetailArticle'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

const calculateReadingTime = (content: string) =>
  Math.ceil(content.length / 500) || 3

const formatLongDate = (dateStr: string, locale: string) =>
  new Date(dateStr).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export function generateStaticParams() {
  const blogs = getStaticBlogs('th')
  return blogs.map((blog) => ({ slug: blog.slug }))
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const blog = getStaticBlogBySlug(slug, locale)

  if (!blog) {
    return {
      title: 'Sitepow Store',
    }
  }

  const title = `${blog.title} | Sitepow Store`
  const canonicalUrl = `/blogs/${blog.slug}`

  return {
    title,
    description: blog.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        th: `${canonicalUrl}?lang=th`,
        en: `${canonicalUrl}?lang=en`,
      },
    },
    openGraph: {
      title,
      description: blog.description,
      images: [{ url: blog.image, alt: blog.title }],
      type: 'article',
      publishedTime: blog.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: blog.description,
      images: [blog.image],
    },
  }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params
  const locale = await getLocale()

  const allBlogs = getStaticBlogs(locale)
  const blog = allBlogs.find((item) => item.slug === slug)

  if (!blog) {
    notFound()
  }

  const relatedBlogs = allBlogs.filter((item) => item.slug !== slug).slice(0, 3)

  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-2 pb-10 sm:gap-12 sm:pt-4 sm:pb-12 md:gap-20">
      <BlogDetailArticle
        blog={blog}
        formattedDate={formatLongDate(blog.createdAt, locale)}
        readingMinutes={calculateReadingTime(blog.content)}
        relatedBlogs={relatedBlogs}
      />
      <CtaSection />
    </MainLayout>
  )
}
