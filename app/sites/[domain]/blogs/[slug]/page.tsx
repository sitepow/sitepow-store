import Link from 'next/link'

import { BLOGS } from '@/constants/sites/blog'
import { StorePageProps } from '@/types/sites/page'
import { formatDate } from '@/utils/date'
import {
  CalendarIcon,
  ChevronLeft,
  Clock,
  HeartIcon,
  Share2Icon,
  Tag,
  User2,
} from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { StoreLayout } from '../../_components/layout/Layout'

export default async function StoreBlogDescriptionPage({
  params,
}: StorePageProps) {
  const { slug } = await params
  const date = new Date()
  const blog = BLOGS.find((blog) => blog.slug === slug)

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="flex w-full flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link href={'/blogs'}>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary -ml-4"
              >
                <ChevronLeft className="mr-2 size-4" />
                <span>ย้อนกลับ</span>
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <HeartIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2Icon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-primary px-3 py-1">
                Gadget Review
              </Badge>
            </div>

            <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              {blog?.title}
            </h1>

            <div className="text-muted-foreground flex items-center justify-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="size-8 border">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User2 size={16} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground font-medium">Admin Team</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={16} />
                <span>{formatDate(date)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>อ่าน 5 นาที</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gray-100"></div>
        </div>

        <div className="mx-auto max-w-3xl py-12">
          <article className="prose prose-slate lg:prose-xl prose-headings:font-bold prose-a:text-primary max-w-none">
            {/* <MarkdownRenderer content={blog?.content} /> */}
            <p className="text-muted-foreground text-xl leading-relaxed">
              นี่คือส่วนของคำนำบทความที่จะช่วยดึงดูดความสนใจผู้อ่าน (Intro
              description) ซึ่งคุณสามารถใช้ Markdown Render มาวางทับตรงนี้ได้เลย
            </p>
          </article>

          <div className="mt-12 flex items-center gap-3 border-t pt-8">
            <Tag size={18} className="text-muted-foreground" />
            <div className="flex gap-2">
              {['Tech', 'Lifestyle', 'Review'].map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
