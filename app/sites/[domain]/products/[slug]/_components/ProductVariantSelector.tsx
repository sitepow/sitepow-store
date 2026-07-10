'use client'

import { useEffect } from 'react'

import { DiscountType, ProductType } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import { calculateNetPrice, getStockQuantity } from '@/utils/product'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

import { useProductPurchaseStore } from '../../store'

export function ProductVariantSelector() {
  const {
    product,
    selectedVariant,
    selectVariant,
    isLoading,
    selectedBranchId,
    setSelectedBranch,
  } = useProductPurchaseStore()

  const isPhysical = product?.productType === ProductType.PHYSICAL
  const hasVariant = product?.variants?.length !== 0

  useEffect(() => {
    if (!isPhysical) {
      return
    }

    const firstVariant = product?.variants?.[0]
    const firstStock = firstVariant?.stocks?.[0]

    if (!selectedBranchId && firstStock) {
      setSelectedBranch(
        firstStock.branchId,
        firstStock.branch?.name || `สาขา ${firstStock.branchId}`,
      )
    }
  }, [product, selectedBranchId, setSelectedBranch, isPhysical])

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
            {isPhysical && (
              <div className="space-y-2">
                <Label className="text-lg font-semibold">
                  สาขาที่รับสินค้า
                </Label>
                <Select
                  value={selectedBranchId || ''}
                  onValueChange={(val) => {
                    const selectedBranchName =
                      product?.variants[0]?.stocks.find(
                        (s) => s.branchId === val,
                      )?.branch?.name
                    setSelectedBranch(val, selectedBranchName || `สาขา ${val}`)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="กรุณาเลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    {product?.variants[0]?.stocks.map((stock) => (
                      <SelectItem key={stock.branchId} value={stock.branchId}>
                        {stock?.branch?.name || `สาขา ${stock.branchId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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

                const isAvaliable = variant.isAvailable
                const stock = getStockQuantity(
                  variant,
                  product.productType,
                  selectedBranchId,
                )

                return (
                  <Label
                    htmlFor={variant.id}
                    key={variant.id}
                    className={cn(
                      'hover:bg-accent relative flex items-start space-x-3 rounded-lg border p-3 transition-colors',
                      (!isAvaliable || stock <= 0) &&
                        'cursor-not-allowed opacity-50',
                    )}
                  >
                    <RadioGroupItem
                      value={variant.id}
                      id={variant.id}
                      disabled={!isAvaliable || stock <= 0}
                      className="data-checked:text-primary-foreground aria-invalid:aria-checked:border-(--brand-color) data-checked:border-(--brand-color) data-checked:bg-(--brand-color) dark:data-checked:bg-(--brand-color)"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="cursor-pointer text-xs">
                        {variant.title}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {hasDiscount &&
                          variant.discountType === DiscountType.PERCENTAGE && (
                            <span className="text-[10px] font-semibold text-(--brand-color)">
                              ส่วนลด {variant.discountAmount}%
                            </span>
                          )}
                        {hasPoint && (
                          <span className="text-[10px] font-semibold text-(--brand-color)">
                            + {variant.pointsAmount} แต้ม
                          </span>
                        )}
                      </div>
                      <div>
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-(--brand-color)">
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
                  </Label>
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
