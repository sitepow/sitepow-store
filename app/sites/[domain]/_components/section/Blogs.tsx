'use client'

import { useStorefrontBlogs } from '@/actions/hooks/storefront/blog'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'

import { SeeMoreButton } from '../SeeMoreButton'
import { BlogCard } from '../blog/BlogCard'

export function BlogsSection({ storeSlug }: { storeSlug: string }) {
  const { data, isLoading } = useStorefrontBlogs({ storeSlug, limit: 5 })
  const blogs = data?.data ?? []

  if (isLoading || blogs.length === 0) {
    return null
  }

  const enableBlogFeature = blogs.length >= 4

  return (
    <SectionContainer>
      <SectionHeader title="บทความล่าสุด" />
      <div className="grid w-full grid-flow-row-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {blogs.map((blog, index) => {
          const isFirst = index === 0

          return (
            <div
              key={blog.id}
              className={
                isFirst && enableBlogFeature
                  ? 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2'
                  : 'col-span-1'
              }
            >
              <BlogCard blog={blog} isFeatured={isFirst && enableBlogFeature} />
            </div>
          )
        })}
      </div>
      <SeeMoreButton href="/blogs" />
    </SectionContainer>
  )
}
