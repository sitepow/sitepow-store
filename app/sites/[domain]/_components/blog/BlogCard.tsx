import Link from 'next/link'

import { Blog } from '@/types/sites/blog'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

const blogCardVariants = cva(
  'h-full rounded-xl transition-all overflow-hidden group',
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
}

export function BlogCard({ variant, className, title, slug }: BlogCardProps) {
  return (
    <Link href={`/blogs/${slug}`}>
      <div className={cn(blogCardVariants({ variant }), className)}>
        <div className="mb-2.5 h-52 w-full overflow-hidden rounded-t-xl bg-gray-200">
          <div className="mb-2.5 h-52 w-full rounded-xl bg-gray-200" />
        </div>

        <div className="p-4 pt-0">
          <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-xl leading-tight font-bold">
            {title || 'Untitled Blog Post'}
          </h3>

          <div className="flex justify-start">
            <Button variant="link">
              <span>อ่านต่อ</span>
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
