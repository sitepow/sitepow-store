import { notFound } from 'next/navigation'

import { getStorefrontBlogDetail } from '@/actions/storefront/blog/actions'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { BlogHeader } from '../_components/BlogHeader'
import { BlogTags } from '../_components/BlogTags'

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

  return (
    <StoreLayout>
      <SectionContainer>
        <article
          itemScope
          itemType="https://schema.org/BlogPosting"
          className="mx-auto max-w-4xl"
        >
          <header className="space-y-6">
            <BlogHeader createdAt={blog.createdAt} readingTime={readingTime} />
            <h1
              itemProp="headline"
              className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-start"
            >
              {blog.title}
            </h1>
          </header>
          <div className="mx-auto max-w-3xl py-8 text-start">
            <div itemProp="articleBody">
              {blog.content && <MarkdownRenderer content={blog.content} />}
            </div>
            <BlogTags tags={blog.tags} />
          </div>
        </article>
      </SectionContainer>
    </StoreLayout>
  )
}
