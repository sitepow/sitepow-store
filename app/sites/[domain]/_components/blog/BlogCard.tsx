/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { StorefrontBlogListItem } from '@/actions/storefront/blog'
import { isVideoUrl } from '@/utils/media'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { EmptyImage } from '../EmptyImage'

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
    <Link href={`/blogs/${blog.slug}`} className="block h-full">
      <div className={cn(blogCardVariants({ variant }), className)}>
        <div
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
                />
              ) : (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="size-full object-cover"
                />
              )}
            </div>
          ) : (
            <EmptyImage />
          )}
        </div>
        <div
          className={cn(
            'flex shrink-0 flex-col p-4',
            isFeatured ? 'lg:justify-center lg:p-6' : 'flex-1',
          )}
        >
          <h3
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
            <Button variant="link" className="text-primary h-auto p-0">
              <span className="mr-1">อ่านต่อ</span>
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
