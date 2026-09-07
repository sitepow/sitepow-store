import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getStaticBlogBySlug, getStaticBlogs } from '@/constants/blogs'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'

import { BlogShareButton } from '../_components/BlogShareButton'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
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
  const t = await getTranslations('blogs')
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
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link
              href="/blogs"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="size-4" />
              <span>{t('backToBlogs')}</span>
            </Link>
          </Button>
          <BlogShareButton title={blog.title} />
        </div>
        <div className="space-y-2.5 text-start sm:space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs"
              >
                <Tag className="size-3" />
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-foreground text-xl leading-tight font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            {blog.title}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-0.5 text-[11px] font-medium sm:gap-4 sm:pt-1 sm:text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {t('readingTime', { minutes: readingMinutes })}
            </span>
            <span>•</span>
            <span>{t('author')}</span>
          </div>
          <p className="text-muted-foreground border-border/70 border-b pt-1 pb-4 text-xs leading-relaxed sm:pt-2 sm:pb-6 sm:text-base">
            {blog.description}
          </p>
        </div>
        <div className="border-border/80 bg-muted relative aspect-video w-full overflow-hidden rounded-2xl border shadow-md sm:rounded-3xl">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
        <div className="mx-auto w-full pt-2 sm:pt-4">
          <MarkdownRenderer content={blog.content} className="max-w-none" />
        </div>
        <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-t pt-4 sm:gap-4 sm:pt-8">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-muted-foreground text-xs font-semibold">
              {t('tags')}:
            </span>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded-lg px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
          <BlogShareButton title={blog.title} />
        </div>
      </div>
      {relatedBlogs.length > 0 && (
        <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
          <div className="border-border/70 border-t pt-6 sm:pt-12">
            <h2 className="text-foreground pb-3 text-lg font-bold sm:pb-6 sm:text-2xl">
              {t('badge')}
            </h2>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {relatedBlogs.map((item) => (
                <article
                  key={item.id}
                  className="bg-card/60 hover:bg-card border-border/80 hover:border-border group flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl"
                >
                  <Link
                    href={`/blogs/${item.slug}`}
                    className="bg-muted relative block h-36 w-full overflow-hidden sm:h-44"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-5">
                    <Link href={`/blogs/${item.slug}`}>
                      <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-xs font-bold transition-colors sm:text-base">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground line-clamp-2 pt-1 text-xs leading-relaxed sm:pt-2">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
      <CtaSection />
    </MainLayout>
  )
}
