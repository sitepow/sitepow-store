'use client'

import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { TagIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useProductPurchaseStore } from '../../products/store'

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
                <span className="text-muted-foreground text-sm">
                  {metadataLabelMap[key] ?? key.replace(/_/g, ' ')}
                </span>
                <span className="font-medium text-slate-900">
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
              <Badge key={tag.name} variant="outline" className="capitalize">
                <TagIcon /> {tag.name}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
