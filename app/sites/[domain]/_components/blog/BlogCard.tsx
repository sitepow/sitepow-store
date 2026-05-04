import Link from 'next/link'

import { Blog } from '@/types/sites/blog'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

const blogCardVariants = cva(
  'h-full rounded-xl transition-all overflow-hidden group flex flex-col',
  {
    variants: {
      variant: {
        outline: 'border border-gray-100 hover:border-primary/50',
        shadow: 'shadow-airy hover:shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
)

interface BlogCardProps
  extends Partial<Blog>, VariantProps<typeof blogCardVariants> {
  className?: string
  isFeatured?: boolean
}

export function BlogCard({
  variant,
  className,
  title,
  slug,
  isFeatured,
}: BlogCardProps) {
  return (
    <Link href={`/blogs/${slug}`} className="block h-full">
      <div className={cn(blogCardVariants({ variant }), className)}>
        <div
          className={cn(
            'w-full overflow-hidden bg-gray-200 transition-all duration-300',
            isFeatured ? 'h-52 lg:h-[82%]' : 'h-52',
          )}
        >
          <div className="h-full w-full bg-gray-300 transition-transform duration-500 group-hover:scale-105" />
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col p-4',
            isFeatured && 'lg:h-32 lg:shrink-0 lg:justify-center',
          )}
        >
          <h3
            className={cn(
              'group-hover:text-primary mb-2 line-clamp-2 text-lg leading-tight font-bold md:text-xl',
              isFeatured && 'lg:mx-auto lg:w-sm lg:text-center',
            )}
          >
            {title!}
          </h3>

          <div
            className={cn(
              'mt-auto flex justify-start',
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
