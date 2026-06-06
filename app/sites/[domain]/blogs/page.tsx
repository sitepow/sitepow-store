import { BLOGS } from '@/constants/sites/blog'

import { SectionContainer } from '@/components/SectionContainer'

import { StorePagination } from '../_components/Pagination'
import { BlogCard } from '../_components/blog/BlogCard'
import { StoreLayout } from '../_components/layout/Layout'

export default function StoreBlogsPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <h1 className="text-4xl leading-tight font-bold">บทความทั้งหมด</h1>

        <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOGS.map((blog) => {
            return <BlogCard key={blog.blogId} {...blog} />
          })}
        </div>

        {/* <StorePagination /> */}
      </SectionContainer>
    </StoreLayout>
  )
}
