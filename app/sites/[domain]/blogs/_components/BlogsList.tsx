'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

import { useStorefrontBlogs } from '@/actions/hooks/storefront/blog'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'

import { StorePagination } from '../../_components/Pagination'
import { BlogCard } from '../../_components/blog/BlogCard'

export function BlogsList({ storeSlug }: { storeSlug: string }) {
  const t = useTranslations('storefront.blogs')
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useStorefrontBlogs({ storeSlug, page, limit: 9 })
  const blogs = data?.data ?? []
  const meta = data?.meta

  if (!isLoading && blogs.length === 0) {
    return (
      <ActionRequiredAlert
        title={t('noBlogsTitle')}
        description={t('noBlogsDesc')}
      />
    )
  }

  return (
    <>
      <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
      {meta && meta.totalPages > 1 && (
        <StorePagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(p))
            router.push(`?${params.toString()}`)
          }}
        />
      )}
    </>
  )
}
