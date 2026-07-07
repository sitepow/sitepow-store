'use client'

import { DiscountType } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../products/store'

export function ProductVariantSelector() {
  const { product, selectedVariant, selectVariant, isLoading } =
    useProductPurchaseStore()
  const hasVariant = product?.variants?.length !== 0

  return (
    <>
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <Label className="text-lg font-semibold">ตัวเลือกสินค้า</Label>

            <RadioGroup
              value={selectedVariant?.id}
              onValueChange={selectVariant}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2"
            >
              {product?.variants?.map((variant) => {
                const discountConfig =
                  variant.discountActive && variant.discountType
                    ? {
                        active: true,
                        type: variant.discountType as DiscountType,
                        amount: variant.discountAmount ?? 0,
                      }
                    : undefined

                const netPrice = calculateNetPrice({
                  price: variant.price,
                  discount: discountConfig,
                })

                const hasDiscount = !!discountConfig && netPrice < variant.price
                const hasPoint = variant.pointsActive

                return (
                  <div
                    key={variant.id}
                    className="hover:bg-accent relative flex items-start space-x-3 rounded-lg border p-3 transition-colors"
                  >
                    <RadioGroupItem
                      value={variant.id}
                      id={variant.id}
                      className="mt-1"
                    />

                    <div className="flex flex-1 flex-col gap-1">
                      <span className="cursor-pointer text-xs">
                        {variant.title}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {hasDiscount &&
                          variant.discountType === DiscountType.PERCENTAGE && (
                            <span className="text-primary text-[10px] font-semibold">
                              ลด {variant.discountAmount}%
                            </span>
                          )}
                        {hasPoint && (
                          <span className="text-[10px] font-semibold text-amber-600">
                            + {variant.pointsAmount} แต้ม
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <span className="text-primary text-sm font-bold">
                              {formatCurrency(netPrice)}
                            </span>
                            <span className="text-muted-foreground text-[10px] line-through">
                              {formatCurrency(variant.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold">
                            {formatCurrency(variant.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </>
        )}
      </div>

      {!isLoading && hasVariant && <Separator />}
    </>
  )
}
