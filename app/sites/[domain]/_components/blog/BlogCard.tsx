/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { StorefrontBlogListItem } from '@/actions/storefront/blog/actions'
import { isVideoUrl } from '@/utils/media/video'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { EmptyImage } from '../shared/EmptyImage'

const blogCardVariants = cva(
  'h-full rounded-xl transition-all overflow-hidden dark:bg-foreground/5 text-foreground group flex flex-col',
  {
    variants: {
      variant: {
        outline: 'border border-border hover:border-primary/50',
        shadow: 'shadow-airy hover:shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
)

interface BlogCardProps extends VariantProps<typeof blogCardVariants> {
  blog: StorefrontBlogListItem
  className?: string
  isFeatured?: boolean
}

export function BlogCard({
  variant,
  className,
  blog,
  isFeatured,
}: BlogCardProps) {
  const isVideo = isVideoUrl(blog.image)

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      aria-label={`อ่านบทความ: ${blog.title}`}
      className="block h-full"
    >
      <article
        itemScope
        itemType="https://schema.org/BlogPosting"
        className={cn(blogCardVariants({ variant }), className)}
      >
        <meta itemProp="mainEntityOfPage" content={`/blogs/${blog.slug}`} />
        <figure
          className={cn(
            'relative w-full overflow-hidden transition-all duration-300',
            isFeatured ? 'min-h-55 flex-1 lg:min-h-70' : 'h-52 shrink-0',
          )}
        >
          {blog.image ? (
            <div className="absolute inset-0 size-full">
              {isVideo ? (
                <video
                  src={blog.image}
                  className="size-full object-cover"
                  muted
                  playsInline
                  loop
                  aria-label={`วิดีโอประกอบบทความ: ${blog.title}`}
                />
              ) : (
                <img
                  itemProp="image"
                  src={blog.image}
                  alt={blog.title}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              )}
            </div>
          ) : (
            <EmptyImage />
          )}
        </figure>
        <div
          className={cn(
            'flex shrink-0 flex-col p-4',
            isFeatured ? 'lg:justify-center lg:p-6' : 'flex-1',
          )}
        >
          <h3
            itemProp="headline"
            className={cn(
              'group-hover:text-primary mb-2 line-clamp-2 text-lg leading-tight font-medium md:text-xl',
              isFeatured && 'lg:text-center lg:text-2xl',
            )}
          >
            {blog.title}
          </h3>
          <div
            className={cn(
              'mt-auto flex justify-start pt-2',
              isFeatured && 'lg:justify-center',
            )}
          >
            <span className="text-primary inline-flex items-center text-sm font-medium">
              <span className="mr-1">อ่านต่อ</span>
              <ArrowRightIcon className="size-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
