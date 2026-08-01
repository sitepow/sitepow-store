import Link from 'next/link'

import { ChevronLeft, HeartIcon, Share2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ProductGalleryHeader() {
  return (
    <div className="flex items-center justify-between">
      <Link href={'/products'}>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary -ml-4"
        >
          <ChevronLeft className="mr-2 size-4" />
          <span>ย้อนกลับ</span>
        </Button>
      </Link>
      <div className="flex gap-2.5">
        <Button variant="outline" size="icon-lg">
          <HeartIcon className="size-4" />
        </Button>
        <Button variant="outline" size="icon-lg">
          <Share2Icon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
