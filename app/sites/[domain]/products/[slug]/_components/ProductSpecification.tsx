'use client'

import { useStorefrontProductDetail } from '@/actions/hooks/storefront/product'
import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { TagIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

interface Props {
  storeSlug?: string
  productSlug?: string
}

const metadataLabelMap = PRODUCT_METADATA_MASTER.reduce<Record<string, string>>(
  (acc, category) => {
    category.fields.forEach(({ key, label }) => {
      acc[key] = label
    })
    return acc
  },
  {},
)

export function ProductSpecification({ storeSlug, productSlug }: Props) {
  const { data: queryProduct } = useStorefrontProductDetail(
    storeSlug ?? '',
    productSlug ?? '',
  )
  const storeProduct = useProductPurchaseStore((s) => s.product)
  const isStoreLoading = useProductPurchaseStore((s) => s.isLoading)

  const product = storeProduct || queryProduct
  const isLoading = !product && isStoreLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-px flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 border-b pb-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-36 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const details = product.details as Record<string, unknown> | null
  const tags = product.tags ?? []

  const hasSpecs = details && Object.keys(details).length > 0
  const hasTags = tags.length > 0

  if (!hasSpecs && !hasTags) {
    return null
  }

  return (
    <div className="space-y-8">
      {hasSpecs && (
        <section aria-labelledby="specifications-heading" className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 id="specifications-heading" className="text-xl font-bold">
              ข้อมูลจำเพาะ
            </h2>
            <Separator className="flex-1" />
          </div>
          <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex flex-col border-b pb-2">
                <dt className="text-muted-foreground text-sm">
                  {metadataLabelMap[key] ?? key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-primary text-sm font-medium">
                  {Array.isArray(value)
                    ? value
                        .map((v) =>
                          typeof v === 'object' && v !== null
                            ? `${v.label}: ${v.value}`
                            : String(v),
                        )
                        .join(', ')
                    : String(value ?? '')}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {hasTags && (
        <section aria-labelledby="tags-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 id="tags-heading" className="text-lg font-bold">
              แท็กสินค้า
            </h3>
            <Separator className="flex-1" />
          </div>
          <ul
            role="list"
            aria-label="แท็กสินค้า"
            className="flex flex-wrap gap-2"
          >
            {tags.map((tag) => (
              <li key={tag.name} className="list-none">
                <Badge variant="outline" className="font-normal">
                  <TagIcon className="mr-1 size-3" /> {tag.name}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
