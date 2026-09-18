'use client'

import { useMemo, useRef, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { type StaticBlogItem, getStaticBlogs } from '@/constants/blogs'
import { useIsMounted } from '@/hooks/use-is-mounted'
import {
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  Search,
  Tag,
  X,
} from 'lucide-react'

import { Input } from '@/components/ui/input'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

const formatDate = (dateStr: string, locale: string) =>
  new Date(dateStr).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const calculateReadingTime = (content: string) =>
  Math.ceil(content.length / 500) || 3

export interface BlogsGridSectionProps {
  initialBlogs?: StaticBlogItem[]
  allTagsText?: string
  searchPlaceholderText?: string
  noBlogsFoundText?: string
  readMoreText?: string
}

export function BlogsGridSection({
  initialBlogs,
  allTagsText,
  searchPlaceholderText,
  noBlogsFoundText,
  readMoreText,
}: BlogsGridSectionProps = {}) {
  const isMounted = useIsMounted()
  const locale = useLocale()
  const t = useTranslations('blogs')

  const [selectedTag, setSelectedTag] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const sectionRef = useRef<HTMLDivElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const texts = {
    allTags: allTagsText ?? t('allTags'),
    searchPlaceholder: searchPlaceholderText ?? t('searchPlaceholder'),
    noBlogsFound: noBlogsFoundText ?? t('noBlogsFound'),
    readMore: readMoreText ?? t('readMore'),
  }

  const allBlogs = useMemo(
    () => initialBlogs ?? getStaticBlogs(locale),
    [initialBlogs, locale],
  )

  const availableTags = useMemo(
    () => Array.from(new Set(allBlogs.flatMap((b) => b.tags))),
    [allBlogs],
  )

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allBlogs.filter((blog) => {
      const matchesTag =
        selectedTag === 'all' || blog.tags.includes(selectedTag)
      const matchesSearch =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.description.toLowerCase().includes(query)
      return matchesTag && matchesSearch
    })
  }, [allBlogs, selectedTag, searchQuery])

  const isDefaultView = selectedTag === 'all' && !searchQuery.trim()
  const featuredBlog = isDefaultView ? filteredBlogs[0] : null
  const restBlogs = isDefaultView ? filteredBlogs.slice(1) : filteredBlogs

  useGSAP(
    () => {
      if (!isMounted) {
        return
      }

      if (featuredRef.current) {
        gsap.fromTo(
          featuredRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: featuredRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted, filteredBlogs] },
  )

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-8 px-3.5 sm:space-y-12 sm:px-6 lg:px-8"
    >
      <BlogFilterBar
        tags={availableTags}
        selectedTag={selectedTag}
        searchQuery={searchQuery}
        allTagsLabel={texts.allTags}
        placeholder={texts.searchPlaceholder}
        onSelectTag={setSelectedTag}
        onSearchChange={setSearchQuery}
      />

      {filteredBlogs.length === 0 ? (
        <BlogEmptyState message={texts.noBlogsFound} />
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {featuredBlog && (
            <FeaturedBlogCard
              ref={featuredRef}
              blog={featuredBlog}
              locale={locale}
              readMoreText={texts.readMore}
              readingTimeText={(min) => t('readingTime', { minutes: min })}
            />
          )}

          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          >
            {restBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                locale={locale}
                readMoreText={texts.readMore}
                readingTimeText={(min) => t('readingTime', { minutes: min })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BlogFilterBar({
  tags,
  selectedTag,
  searchQuery,
  allTagsLabel,
  placeholder,
  onSelectTag,
  onSearchChange,
}: {
  tags: string[]
  selectedTag: string
  searchQuery: string
  allTagsLabel: string
  placeholder: string
  onSelectTag: (tag: string) => void
  onSearchChange: (q: string) => void
}) {
  const getPillStyle = (isActive: boolean) =>
    `shrink-0 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-md'
        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    }`

  return (
    <div className="border-border/60 bg-card/60 relative flex flex-col items-center justify-between gap-3 rounded-2xl border p-2.5 shadow-sm backdrop-blur-xl sm:flex-row sm:rounded-3xl sm:p-3">
      <div className="no-scrollbar flex w-full max-w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
        <button
          onClick={() => onSelectTag('all')}
          className={getPillStyle(selectedTag === 'all')}
        >
          {allTagsLabel}
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={getPillStyle(selectedTag === tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="border-border/70 bg-background/80 focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl pr-8 pl-9.5 text-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function BlogEmptyState({ message }: { message: string }) {
  return (
    <div className="border-border/80 bg-card/40 flex flex-col items-center justify-center rounded-3xl border py-16 text-center shadow-xs">
      <div className="border-border/60 bg-muted/50 mb-3 flex size-12 items-center justify-center rounded-2xl border">
        <Search className="text-muted-foreground size-5" />
      </div>
      <p className="text-foreground text-sm font-semibold">{message}</p>
      <p className="text-muted-foreground mt-1 text-xs">
        ลองปรับคำค้นหาหรือเลือกหมวดหมู่อื่นดูอีกครั้ง
      </p>
    </div>
  )
}

function FeaturedBlogCard({
  ref,
  blog,
  locale,
  readMoreText,
  readingTimeText,
}: {
  ref?: React.Ref<HTMLDivElement>
  blog: StaticBlogItem
  locale: string
  readMoreText: string
  readingTimeText: (min: number) => string
}) {
  return (
    <div ref={ref} className="group relative">
      <Link
        href={`/blogs/${blog.slug}`}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label={blog.title}
      />
      <div className="border-border/80 bg-card/70 hover:border-border relative grid grid-cols-1 overflow-hidden rounded-3xl border shadow-lg backdrop-blur-md transition-all duration-500 hover:shadow-2xl md:grid-cols-12">
        <div className="relative aspect-16/10 w-full overflow-hidden md:col-span-7 md:aspect-auto">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="from-card/90 absolute inset-0 bg-linear-to-t via-transparent to-transparent md:hidden" />
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-5 md:p-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                <Flame className="size-3" />
                Featured
              </span>
              {blog.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="border-border/60 bg-muted/60 text-foreground/80 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-foreground group-hover:text-primary text-xl font-extrabold tracking-tight transition-colors sm:text-2xl lg:text-3xl">
              {blog.title}
            </h2>

            <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed sm:text-sm">
              {blog.description}
            </p>
          </div>

          <div className="pt-6">
            <div className="text-muted-foreground border-border/50 flex items-center justify-between border-t pt-4 text-xs">
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(blog.createdAt, locale)}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {readingTimeText(calculateReadingTime(blog.content))}
                </span>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-bold">
                {readMoreText}
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogCard({
  blog,
  locale,
  readMoreText,
  readingTimeText,
}: {
  blog: StaticBlogItem
  locale: string
  readMoreText: string
  readingTimeText: (min: number) => string
}) {
  return (
    <article className="group border-border/70 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:p-5">
      <Link
        href={`/blogs/${blog.slug}`}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label={blog.title}
      />

      <div>
        <div className="border-border/60 bg-muted/40 relative mb-4 aspect-16/10 w-full overflow-hidden rounded-2xl border shadow-inner">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="from-card/80 absolute inset-0 bg-linear-to-t via-transparent to-transparent opacity-80" />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="bg-background/90 text-foreground inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold shadow-xs backdrop-blur-md"
              >
                <Tag className="text-primary size-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
            <span>{formatDate(blog.createdAt, locale)}</span>
            <span>•</span>
            <span>{readingTimeText(calculateReadingTime(blog.content))}</span>
          </div>

          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-base font-bold transition-colors sm:text-lg">
            {blog.title}
          </h3>

          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:text-sm">
            {blog.description}
          </p>
        </div>
      </div>

      <div className="relative z-20 pt-4 sm:pt-6">
        <div className="border-border/50 flex items-center justify-between border-t pt-3">
          <span className="text-primary group-hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors">
            <span>{readMoreText}</span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  )
}
