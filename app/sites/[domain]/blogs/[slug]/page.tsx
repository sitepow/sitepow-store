import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getStorefrontBlogDetail } from '@/actions/storefront/blog'
import { formatDateTime } from '@/utils/date'
import { isVideoUrl } from '@/utils/media'
import {
  CalendarIcon,
  ChevronLeft,
  Clock,
  HeartIcon,
  Share2Icon,
  TagIcon,
  User2,
} from 'lucide-react'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { EmptyImage } from '../../_components/EmptyImage'
import { StoreLayout } from '../../_components/layout/Layout'

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

export default async function StoreBlogDescriptionPage({ params }: Props) {
  const { domain, slug } = await params
  const blog = await getStorefrontBlogDetail(domain, slug)

  if (!blog) {
    notFound()
  }

  const readingTime = Math.ceil(blog.content.length / 500) || 5
  const isVideo = isVideoUrl(blog.image)

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="flex w-full flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link href="/blogs">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary -ml-4"
              >
                <ChevronLeft className="mr-2 size-4" />
                <span>ย้อนกลับ</span>
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="icon-lg">
                <HeartIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon-lg">
                <Share2Icon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
              {blog.title}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="size-8 border">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User2 size={16} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground font-medium">ผู้ดูแลระบบ</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={16} />
                <span>{formatDateTime(blog.createdAt)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>อ่าน {readingTime} นาที</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl">
            {blog.image ? (
              isVideo ? (
                <video
                  src={blog.image}
                  className="size-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
              ) : (
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              )
            ) : (
              <EmptyImage />
            )}
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12 text-start">
          {blog.content && <MarkdownRenderer content={blog.content} />}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 flex items-center gap-3 border-t pt-8">
              <div className="flex gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    <TagIcon className="mr-1 size-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
