'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useStorefrontBlogs } from '@/actions/hooks/storefront/blog'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'

import { StorePagination } from '../../_components/Pagination'
import { BlogCard } from '../../_components/blog/BlogCard'

export function BlogsList({ storeSlug }: { storeSlug: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useStorefrontBlogs({ storeSlug, page, limit: 9 })
  const blogs = data?.data ?? []
  const meta = data?.meta

  if (!isLoading && blogs.length === 0) {
    return (
      <ActionRequiredAlert
        title="ไม่พบข้อมูลบทความ"
        description="ยังไม่มีบทความในร้านค้านี้ หรือไม่พบข้อมูลตามเงื่อนไขที่ค้นหา"
      />
    )
  }

  return (
    <>
      <ul
        role="list"
        aria-label="รายการบทความ"
        className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {blogs.map((blog) => (
          <li key={blog.id} className="list-none">
            <BlogCard blog={blog} />
          </li>
        ))}
      </ul>
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
