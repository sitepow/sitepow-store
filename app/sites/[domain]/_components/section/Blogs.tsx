import { BLOGS } from '@/constants/sites/blog'
import { ArrowRightIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

import { BlogCard } from '../blog/BlogCard'

export function BlogsSection() {
  return (
    <SectionContainer>
      <h2 className="text-4xl leading-tight font-bold">บทความล่าสุด</h2>

      <div className="grid w-full grid-cols-4 gap-5">
        {BLOGS.map((blog) => {
          return <BlogCard key={blog.blogId} {...blog} />
        })}
      </div>

      <Button variant="outline">
        <span>ดูทั้งหมด</span>
        <ArrowRightIcon />
      </Button>
    </SectionContainer>
  )
}
