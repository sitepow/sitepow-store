import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getStaticBlogBySlug, getStaticBlogs } from '@/constants/blogs'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { BlogDetailArticle } from './_components/BlogDetailArticle'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  const blogs = getStaticBlogs('th')
  return blogs.map((blog) => ({
    slug: blog.slug,
  }))
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
  return {
    title: `${blog.title} | Sitepow Store`,
    description: blog.description,
    alternates: {
      canonical: `/blogs/${blog.slug}`,
      languages: {
        th: `/blogs/${blog.slug}?lang=th`,
        en: `/blogs/${blog.slug}?lang=en`,
      },
    },
    openGraph: {
      title: `${blog.title} | Sitepow Store`,
      description: blog.description,
      images: [blog.image],
    },
  }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params
  const locale = await getLocale()
  const blog = getStaticBlogBySlug(slug, locale)
  if (!blog) {
    notFound()
  }
  const allBlogs = getStaticBlogs(locale)
  const relatedBlogs = allBlogs.filter((b) => b.slug !== slug).slice(0, 3)
  const readingMinutes = Math.ceil(blog.content.length / 500) || 3
  const formattedDate = new Date(blog.createdAt).toLocaleDateString(
    locale === 'th' ? 'th-TH' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )

  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-2 pb-10 sm:gap-12 sm:pt-4 sm:pb-12 md:gap-20">
      <BlogDetailArticle
        blog={blog}
        formattedDate={formattedDate}
        readingMinutes={readingMinutes}
        relatedBlogs={relatedBlogs}
      />
      <CtaSection />
    </MainLayout>
  )
}
