import { BLOGS } from '@/constants/sites/blog'
import { StorePageProps } from '@/types/sites/page'
import { formatDate } from '@/utils/date'

import { SectionContainer } from '@/components/SectionContainer'

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
        <div className="h-106.25 w-full rounded-xl bg-gray-100" />
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
