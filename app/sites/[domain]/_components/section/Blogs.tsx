import Link from 'next/link'

import { BLOGS } from '@/constants/sites/blog'
import { ArrowRightIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

import { BlogCard } from '../blog/BlogCard'

export function BlogsSection() {
  const enableBlogFeature = BLOGS.length >= 4

  return (
    <SectionContainer>
      <h2 className="mb-8 text-4xl leading-tight font-bold">บทความล่าสุด</h2>

      <div className="grid w-full grid-flow-row-dense grid-cols-4 gap-5">
        {BLOGS.slice(0, 5).map((blog, index) => {
          const isFirst = index === 0

          return (
            <div
              key={blog.blogId}
              className={
                isFirst && enableBlogFeature
                  ? 'col-span-2 row-span-2'
                  : 'col-span-1'
              }
            >
              <BlogCard {...blog} isFeatured={isFirst && enableBlogFeature} />
            </div>
          )
        })}
      </div>

      <div className="mt-10">
        <Link href={'/blogs'}>
          <Button variant="outline">
            <span>ดูทั้งหมด</span>
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
        </Link>
      </div>
    </SectionContainer>
  )
}
