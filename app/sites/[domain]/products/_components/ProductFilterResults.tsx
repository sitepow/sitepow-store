'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useStorefrontProducts } from '@/actions/hooks/storefront/product'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { StorePagination } from '../../_components/Pagination'
import { ProductCard } from '../../_components/product/ProductCard'

export function ProductFilterResults({ storeSlug }: { storeSlug: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const categorySlug = searchParams.get('category') ?? undefined
  const sort = searchParams.get('sort') ?? 'latest'
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useStorefrontProducts({
    storeSlug,
    categorySlug,
    page,
    limit: 12,
  })

  const products = data?.data ?? []
  const meta = data?.meta

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="text-foreground flex flex-1 flex-col gap-5 xl:col-span-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2.5">
        {isLoading ? (
          <Skeleton className="h-4 w-32 rounded" />
        ) : (
          <p className="text-muted-foreground text-sm">
            แสดงทั้งหมด{' '}
            <span className="text-foreground font-medium">
              {meta?.totalItems ?? 0}
            </span>{' '}
            รายการ
          </p>
        )}

        <Select value={sort} onValueChange={updateSort}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="latest">เรียงตาม: ล่าสุด</SelectItem>
              <SelectItem value="price_asc">ราคา: น้อยไปมาก</SelectItem>
              <SelectItem value="price_desc">ราคา: มากไปน้อย</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <ActionRequiredAlert
          title="ขออภัย"
          description="ไม่พบสินค้าที่คุณกำลังมองหา"
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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
    </div>
  )
}
