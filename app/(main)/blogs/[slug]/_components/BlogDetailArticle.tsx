'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { StaticBlogItem } from '@/constants/blogs'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Button } from '@/components/ui/button'

import { BlogShareButton } from '../../_components/BlogShareButton'

interface BlogDetailArticleProps {
  blog: StaticBlogItem
  formattedDate: string
  readingMinutes: number
  relatedBlogs: StaticBlogItem[]
}

export function BlogDetailArticle({
  blog,
  formattedDate,
  readingMinutes,
  relatedBlogs,
}: BlogDetailArticleProps) {
  const t = useTranslations('blogs')

  return (
    <article className="w-full">
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link
              href="/blogs"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>{t('backToBlogs')}</span>
            </Link>
          </Button>
          <BlogShareButton title={blog.title} />
        </div>

        <header className="space-y-2.5 text-start sm:space-y-4">
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

          <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            {blog.title}
          </h1>

          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs sm:gap-4 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formattedDate}
            </span>
            <span>•</span>
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
        </header>

        <div className="border-border/60 bg-muted/30 relative aspect-video w-full overflow-hidden rounded-2xl border shadow-lg sm:rounded-3xl">
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

        <footer className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-t pt-4 sm:gap-4 sm:pt-8">
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
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-xs font-semibold sm:text-sm"
              >
                <ArrowLeft className="size-4" />
                <span>{t('backToBlogs')}</span>
              </Link>
            </Button>
            <BlogShareButton title={blog.title} />
          </div>
        </footer>
      </div>

      {relatedBlogs.length > 0 && (
        <RelatedBlogsSection
          blogs={relatedBlogs}
          title={t('relatedBlogs')}
          readMoreLabel={t('readMore')}
        />
      )}
    </article>
  )
}

function RelatedBlogsSection({
  blogs,
  title,
  readMoreLabel,
}: {
  blogs: StaticBlogItem[]
  title: string
  readMoreLabel: string
}) {
  return (
    <section className="mx-auto mt-8 w-full max-w-7xl space-y-4 px-3.5 sm:mt-12 sm:space-y-8 sm:px-6 lg:px-8">
      <div className="border-border/70 border-t pt-6 sm:pt-12">
        <h2 className="text-foreground pb-3 text-center text-lg font-bold sm:pb-8 sm:text-2xl">
          {title}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((item) => (
            <RelatedBlogCard
              key={item.id}
              item={item}
              readMoreLabel={readMoreLabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedBlogCard({
  item,
  readMoreLabel,
}: {
  item: StaticBlogItem
  readMoreLabel: string
}) {
  return (
    <article className="group border-border/80 bg-card hover:border-primary/50 relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-5">
      <Link
        href={`/blogs/${item.slug}`}
        className="bg-muted border-border/60 relative block h-40 w-full overflow-hidden rounded-xl border shadow-inner sm:h-44"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 340px"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between pt-3 sm:pt-4">
        <div>
          <Link href={`/blogs/${item.slug}`}>
            <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-xs font-bold transition-colors sm:text-sm">
              {item.title}
            </h3>
          </Link>
          <p className="text-muted-foreground line-clamp-2 pt-1 text-xs leading-relaxed sm:pt-1.5">
            {item.description}
          </p>
        </div>

        <div className="pt-3">
          <Link
            href={`/blogs/${item.slug}`}
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
          >
            <span>{readMoreLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
