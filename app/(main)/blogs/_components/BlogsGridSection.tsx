'use client'
import { useMemo, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { getStaticBlogs } from '@/constants/blogs'
import { ArrowRight, Calendar, Clock, Search, Tag } from 'lucide-react'

import { Input } from '@/components/ui/input'

export function BlogsGridSection() {
  const locale = useLocale()
  const t = useTranslations('blogs')
  const allBlogs = useMemo(() => getStaticBlogs(locale), [locale])
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>()
    allBlogs.forEach((blog) => {
      blog.tags.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
  }, [allBlogs])

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      const matchesTag =
        selectedTag === 'all' || blog.tags.includes(selectedTag)
      const matchesSearch =
        !searchQuery.trim() ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTag && matchesSearch
    })
  }, [allBlogs, selectedTag, searchQuery])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex max-w-full flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedTag === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('allTags')}
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-9 rounded-xl pl-9 text-xs"
          />
        </div>
      </div>
      {filteredBlogs.length === 0 ? (
        <div className="border-border/80 bg-card/40 flex flex-col items-center justify-center rounded-3xl border py-16 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            {t('noBlogsFound')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog) => {
            const readingMinutes = Math.ceil(blog.content.length / 500) || 3
            const formattedDate = new Date(blog.createdAt).toLocaleDateString(
              locale === 'th' ? 'th-TH' : 'en-US',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )
            return (
              <article
                key={blog.id}
                className="bg-card/60 hover:bg-card border-border/80 hover:border-border group flex flex-col overflow-hidden rounded-3xl border shadow-xs transition-all duration-300 hover:shadow-md"
              >
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="bg-muted relative block h-48 w-full overflow-hidden"
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
                      <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-base font-bold transition-colors sm:text-lg">
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
                      <span>{t('readMore')}</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
