'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { StaticBlogItem } from '@/constants/blogs'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Button } from '@/components/ui/button'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

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
  const isMounted = useIsMounted()
  const articleRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted || !articleRef.current) {
        return
      }

      const introElements = articleRef.current.querySelectorAll(
        '[data-animate="intro"]',
      )
      if (introElements.length > 0) {
        gsap.fromTo(
          introElements,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
          },
        )
      }

      const relatedSection = articleRef.current.querySelector(
        '[data-animate="related"]',
      )
      const relatedDeck = articleRef.current.querySelector(
        '[data-animate="deck"]',
      )

      if (relatedSection) {
        const heading = relatedSection.querySelector('h2')
        if (heading) {
          gsap.fromTo(
            heading,
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: heading,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        }
      }

      if (relatedDeck) {
        gsap.fromTo(
          relatedDeck.children,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: relatedDeck,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: articleRef, dependencies: [isMounted, blog.slug, relatedBlogs] },
  )

  return (
    <article ref={articleRef} className="w-full">
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
        <div
          data-animate="intro"
          className="flex items-center justify-between gap-3 sm:gap-4"
        >
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

        <header
          data-animate="intro"
          className="space-y-2.5 text-start sm:space-y-4"
        >
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
        </header>

        <div
          data-animate="intro"
          className="border-border/80 bg-muted relative aspect-video w-full overflow-hidden rounded-2xl border shadow-md sm:rounded-3xl"
        >
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>

        <div data-animate="intro" className="mx-auto w-full pt-2 sm:pt-4">
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
          <BlogShareButton title={blog.title} />
        </footer>
      </div>

      {relatedBlogs.length > 0 && (
        <RelatedBlogsSection
          blogs={relatedBlogs}
          title={t('badge')}
          readMoreLabel={t('readMore') ?? 'อ่านเพิ่มเติม'}
        />
      )}
    </article>
  )
}

function getCardFanTransform(
  index: number,
  total: number,
): React.CSSProperties {
  if (total <= 1) {
    return {
      '--card-rotate': '0deg',
      '--card-y': '0px',
    } as React.CSSProperties
  }

  const mid = (total - 1) / 2
  const offset = index - mid
  return {
    '--card-rotate': `${offset * 5.5}deg`,
    '--card-y': `${Math.abs(offset) * 10}px`,
  } as React.CSSProperties
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
    <section
      data-animate="related"
      className="mx-auto mt-8 w-full max-w-7xl space-y-4 px-3.5 sm:mt-12 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div className="border-border/70 border-t pt-6 sm:pt-12">
        <h2 className="text-foreground pb-3 text-center text-lg font-bold sm:pb-8 sm:text-2xl">
          {title}
        </h2>

        <div className="relative mx-auto flex w-full justify-center overflow-visible py-4 perspective-distant sm:py-8">
          <div
            data-animate="deck"
            className="group/deck flex w-full max-w-5xl flex-col items-center justify-center gap-4 sm:flex-row sm:-space-x-14 md:-space-x-20 lg:-space-x-24"
          >
            {blogs.map((item, index) => (
              <RelatedBlogCard
                key={item.id}
                item={item}
                style={getCardFanTransform(index, blogs.length)}
                readMoreLabel={readMoreLabel}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RelatedBlogCard({
  item,
  style,
  readMoreLabel,
}: {
  item: StaticBlogItem
  style: React.CSSProperties
  readMoreLabel: string
}) {
  return (
    <article
      style={style}
      className="group border-border/80 bg-card/90 hover:border-primary/50 hover:bg-card relative flex w-full max-w-85 shrink-0 translate-y-0 rotate-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-500 ease-out hover:z-30! hover:shadow-2xl sm:transform-[rotate(var(--card-rotate))_translateY(var(--card-y))] sm:rounded-3xl sm:p-5 sm:hover:-translate-y-7! sm:hover:scale-105! sm:hover:rotate-0!"
    >
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
