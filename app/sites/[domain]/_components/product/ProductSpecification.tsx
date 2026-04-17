'use client'

import { TagIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useProductPurchaseStore } from '../../products/store'

export function ProductSpecification() {
  const { product } = useProductPurchaseStore()
  if (!product?.metadata) {
    return null
  }

  const hasSpecs = Object.keys(product?.metadata ?? {}).some(
    (key) => key !== 'tags',
  )
  const hasTags = (product?.metadata?.tags?.length ?? 0) > 0

  return (
    <div className="mt-10 space-y-6">
      {hasSpecs && (
        <>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">ข้อมูลจำเพาะ</h3>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
            {Object.entries(product?.metadata).map(([key, value]) => {
              if (key === 'tags') {
                return null
              }

              return (
                <div key={key} className="flex flex-col border-b pb-2">
                  <span className="text-muted-foreground text-sm capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-medium text-slate-900 capitalize">
                    {Array.isArray(value)
                      ? value
                          .map((v) =>
                            typeof v === 'object'
                              ? `${v.label}: ${v.value}`
                              : v,
                          )
                          .join(', ')
                      : String(value)}
                  </span>
                </div>
              )
            })}
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
            {(product?.metadata?.tags ?? []).map((tag) => (
              <Badge key={tag} variant="outline" className="capitalize">
                <TagIcon /> {tag}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
