import Link from 'next/link'

import { BLOGS } from '@/constants/sites/blog'
import { StorePageProps } from '@/types/sites/page'
import { formatDate } from '@/utils/date'
import { ChevronLeft, HeartIcon, Share2Icon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

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
        <div className="flex w-full flex-col gap-5">
          <div className="flex items-center justify-between">
            <Link href={'/'}>
              <Button variant="outline">
                <ChevronLeft />
                <span>ย้อนกลับ</span>
              </Button>
            </Link>

            <div className="flex gap-2.5">
              <Button variant="outline">
                <HeartIcon />
              </Button>
              <Button variant="outline">
                <Share2Icon />
              </Button>
            </div>
          </div>

          <div className="h-106.25 w-full rounded-xl bg-gray-100" />
        </div>
        <div className="my-2.5 flex w-full flex-col justify-start text-start">
          <h1 className="text-start text-4xl leading-tight font-bold">
            {blog?.title}
          </h1>
          <time className="mt-2 text-sm text-gray-500">{formatDate(date)}</time>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
