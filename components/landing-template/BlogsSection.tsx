'use client'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { StaticBlogItem, getStaticBlogs } from '@/constants/blogs'
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface BlogsSectionProps {
  badge?: string
  title?: string
  description?: string
  viewAll?: string
  readMore?: string
  blogs?: StaticBlogItem[]
}

export function BlogsSection({
  badge,
  title,
  description,
  viewAll,
  readMore,
  blogs: propBlogs,
}: BlogsSectionProps = {}) {
  const locale = useLocale()
  const t = useTranslations('home.blogs')
  const blogs = propBlogs ?? getStaticBlogs(locale).slice(0, 4)

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')
  const resolvedViewAll = viewAll ?? t('viewAll')
  const resolvedReadMore = readMore ?? t('readMore')

  return (
    <section id="blogs" className="relative w-full py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader title={resolvedTitle} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogs.map((blog, idx) => {
            const isFeatured = idx === 0
            const readingMinutes = Math.ceil(blog.content.length / 500) || 3
            const formattedDate = new Date(blog.createdAt).toLocaleDateString(
              locale === 'th' ? 'th-TH' : 'en-US',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )

            return (
              <article
                key={blog.id}
                className={`bg-card/60 hover:bg-card border-border/80 hover:border-border group flex flex-col overflow-hidden rounded-3xl border shadow-xs transition-all duration-300 hover:shadow-md ${
                  isFeatured ? 'sm:col-span-2 lg:col-span-2' : 'col-span-1'
                }`}
              >
                <Link
                  href={`/blogs/${blog.slug}`}
                  className={`bg-muted relative block w-full overflow-hidden ${
                    isFeatured ? 'h-56 sm:h-72' : 'h-48'
                  }`}
                >
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {blog.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-background/90 text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-xs backdrop-blur-xs"
                      >
                        <Tag className="text-primary size-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div className="space-y-2.5">
                    <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formattedDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {t('readingTime', { minutes: readingMinutes })}
                      </span>
                    </div>
                    <Link href={`/blogs/${blog.slug}`} className="block">
                      <h3
                        className={`text-foreground group-hover:text-primary line-clamp-2 font-bold transition-colors ${
                          isFeatured
                            ? 'text-lg sm:text-xl'
                            : 'text-base sm:text-lg'
                        }`}
                      >
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:text-sm">
                      {blog.description}
                    </p>
                  </div>

                  <div className="pt-4">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                      <span>{resolvedReadMore}</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline" className="rounded-xl px-6">
            <Link href="/blogs" className="inline-flex items-center gap-2">
              <span>{resolvedViewAll}</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
