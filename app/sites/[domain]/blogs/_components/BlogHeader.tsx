import Link from 'next/link'

import { ChevronLeft, HeartIcon, Share2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { BlogMetaBadge } from './BlogMetaBadge'

interface BlogHeaderProps {
  createdAt: string | Date
  readingTime?: number
}

export function BlogHeader({ createdAt, readingTime }: BlogHeaderProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-5 sm:justify-between">
      <Link href="/blogs">
        <Button
          variant="ghost"
          aria-label="ย้อนกลับไปหน้ารวมบทความ"
          className="text-muted-foreground hover:text-primary -ml-4"
        >
          <ChevronLeft className="mr-2 size-4" />
          <span>ย้อนกลับ</span>
        </Button>
      </Link>
      <BlogMetaBadge createdAt={createdAt} readingTime={readingTime} />
      <div className="flex gap-2">
        <Button variant="outline" size="icon-lg" aria-label="ถูกใจบทความนี้">
          <HeartIcon className="size-4" />
        </Button>
        <Button variant="outline" size="icon-lg" aria-label="แชร์บทความนี้">
          <Share2Icon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
