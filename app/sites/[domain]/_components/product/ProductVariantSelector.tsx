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
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <Label className="text-lg font-semibold">ตัวเลือกสินค้า</Label>
            <RadioGroup
              value={selectedVariant?.id}
              onValueChange={selectVariant}
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
                    className="hover:bg-accent flex items-center space-y-0 space-x-3 rounded-lg border p-3 transition-colors"
                  >
                    <RadioGroupItem value={variant.id} id={variant.id} />

                    <div className="flex flex-1 flex-col gap-0.5">
                      <Label
                        htmlFor={variant.id}
                        className="cursor-pointer font-medium"
                      >
                        {variant.title}
                      </Label>
                      <div className="flex gap-2.5">
                        {hasDiscount &&
                          variant.discountType === DiscountType.PERCENTAGE && (
                            <span className="text-primary text-xs font-semibold">
                              ลด {variant.discountAmount}%
                            </span>
                          )}
                        {hasPoint && (
                          <span className="text-primary text-xs font-semibold">
                            + {variant.pointsAmount} แต้มสะสม
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {hasDiscount ? (
                        <>
                          <span className="text-primary text-sm font-bold">
                            {formatCurrency(netPrice)}
                          </span>
                          <span className="text-muted-foreground text-xs line-through">
                            {formatCurrency(variant.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold">
                          {formatCurrency(variant.price)}
                        </span>
                      )}
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
