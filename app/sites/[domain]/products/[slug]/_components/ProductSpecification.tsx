'use client'

import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { TagIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

const metadataLabelMap = PRODUCT_METADATA_MASTER.reduce<Record<string, string>>(
  (acc, category) => {
    category.fields.forEach(({ key, label }) => {
      acc[key] = label
    })
    return acc
  },
  {},
)

export function ProductSpecification() {
  const product = useProductPurchaseStore((s) => s.product)
  const isLoading = useProductPurchaseStore((s) => s.isLoading)

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
    <div className="space-y-6">
      {hasSpecs && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">ข้อมูลจำเพาะ</h3>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex flex-col border-b pb-2">
                <span className="text-sm opacity-60">
                  {metadataLabelMap[key] ?? key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm">
                  {Array.isArray(value)
                    ? value
                        .map((v) =>
                          typeof v === 'object' && v !== null
                            ? `${v.label}: ${v.value}`
                            : String(v),
                        )
                        .join(', ')
                    : String(value ?? '')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {hasTags && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">แท็กสินค้า</h3>
            <Separator className="flex-1" />
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {tags.map((tag) => (
              <Badge key={tag.name} variant="outline" className="font-normal">
                <TagIcon /> {tag.name}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
