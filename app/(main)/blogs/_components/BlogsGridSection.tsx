'use client'
import { useMemo, useRef, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { getStaticBlogs } from '@/constants/blogs'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ArrowRight, Calendar, Clock, Search, Tag } from 'lucide-react'

import { Input } from '@/components/ui/input'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

export function BlogsGridSection() {
  const isMounted = useIsMounted()
  const locale = useLocale()
  const t = useTranslations('blogs')
  const allBlogs = useMemo(() => getStaticBlogs(locale), [locale])
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const sectionRef = useRef<HTMLDivElement>(null)
  const filterBarRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const hasAnimatedFilterBar = useRef(false)

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

  useGSAP(
    () => {
      if (!isMounted) return

      if (filterBarRef.current && !hasAnimatedFilterBar.current) {
        hasAnimatedFilterBar.current = true
        gsap.fromTo(
          filterBarRef.current,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: filterBarRef.current,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (gridRef.current) {
        const cards = Array.from(gridRef.current.children)
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted, filteredBlogs] },
  )

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div
        ref={filterBarRef}
        className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4"
      >
        <div className="flex max-w-full flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all sm:px-3.5 sm:py-1.5 ${
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
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all sm:px-3.5 sm:py-1.5 ${
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
        <div className="border-border/80 bg-card/40 flex flex-col items-center justify-center rounded-2xl border py-10 text-center sm:rounded-3xl sm:py-16">
          <p className="text-muted-foreground text-sm font-medium">
            {t('noBlogsFound')}
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {filteredBlogs.map((blog) => {
            const readingMinutes = Math.ceil(blog.content.length / 500) || 3
            const formattedDate = new Date(blog.createdAt).toLocaleDateString(
              locale === 'th' ? 'th-TH' : 'en-US',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )
            return (
              <article
                key={blog.id}
                className="bg-card/60 hover:bg-card border-border/80 hover:border-border group flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl"
              >
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="bg-muted relative block h-40 w-full overflow-hidden sm:h-48"
                >
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 sm:top-3 sm:left-3">
                    {blog.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-background/90 text-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-xs backdrop-blur-xs sm:px-2.5 sm:text-[11px]"
                      >
                        <Tag className="text-primary size-2.5 sm:size-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-2.5">
                    <div className="text-muted-foreground flex items-center gap-2.5 text-[11px] sm:gap-3">
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
                      <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-bold transition-colors sm:text-lg">
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:text-sm">
                      {blog.description}
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4">
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
