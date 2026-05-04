import { BLOGS } from '@/constants/sites/blog'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'

import { SeeMoreButton } from '../SeeMoreButton'
import { BlogCard } from '../blog/BlogCard'

export function BlogsSection() {
  const enableBlogFeature = BLOGS.length >= 4

  return (
    <SectionContainer>
      <SectionHeader title="บทความล่าสุด" />

      <div className="grid w-full grid-flow-row-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BLOGS.slice(0, 5).map((blog, index) => {
          const isFirst = index === 0

          return (
            <div
              key={blog.blogId}
              className={
                isFirst && enableBlogFeature
                  ? 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2'
                  : 'col-span-1'
              }
            >
              <BlogCard {...blog} isFeatured={isFirst && enableBlogFeature} />
            </div>
          )
        })}
      </div>

      <SeeMoreButton href="/blogs" />
    </SectionContainer>
  )
}
