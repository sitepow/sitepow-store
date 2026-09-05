'use client'

import { useEffect, useMemo } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { EmptyImage } from '@/app/sites/[domain]/_components/EmptyImage'
import { DiscountType, ProductType } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import { calculateNetPrice, getStockQuantity } from '@/utils/product'

import { Badge } from '@/components/ui/badge'
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
  const t = useTranslations('storefront.products')
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

  const allBranches = useMemo(() => {
    const branchMap = new Map()
    product?.variants?.forEach((variant) => {
      variant.stocks?.forEach((stock) => {
        if (stock.branchId && !branchMap.has(stock.branchId)) {
          branchMap.set(
            stock.branchId,
            stock.branch?.name || t('branchPrefix', { name: stock.branchId }),
          )
        }
      })
    })
    return Array.from(branchMap.entries()).map(([branchId, branchName]) => ({
      branchId,
      branchName,
    }))
  }, [product, t])

  useEffect(() => {
    if (!isPhysical) {
      return
    }

    const firstBranch = allBranches[0]

    if (!selectedBranchId && firstBranch) {
      setSelectedBranch(firstBranch.branchId, firstBranch.branchName)
    }
  }, [allBranches, selectedBranchId, setSelectedBranch, isPhysical])

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
                  {t('branchPickup')}
                </Label>
                <Select
                  value={selectedBranchId || ''}
                  onValueChange={(val) => {
                    const foundBranch = allBranches.find(
                      (b) => b.branchId === val,
                    )
                    setSelectedBranch(
                      val,
                      foundBranch?.branchName ||
                        t('branchPrefix', { name: val }),
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectBranch')} />
                  </SelectTrigger>
                  <SelectContent>
                    {allBranches.map((branch) => (
                      <SelectItem key={branch.branchId} value={branch.branchId}>
                        {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Label className="text-lg font-semibold">{t('options')}</Label>
            <RadioGroup
              value={selectedVariant?.id}
              onValueChange={selectVariant}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"
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

                const variantImageUrl = variant.image || null

                return (
                  <Label
                    htmlFor={variant.id}
                    key={variant.id}
                    className={cn(
                      'hover:bg-accent relative flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors',
                      selectedVariant?.id === variant.id &&
                        'border-primary bg-accent/50',
                      (!isAvaliable || stock <= 0) &&
                        'cursor-not-allowed opacity-50',
                    )}
                  >
                    <RadioGroupItem
                      value={variant.id}
                      id={variant.id}
                      disabled={!isAvaliable || stock <= 0}
                      className="data-checked:text-primary-foreground aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary dark:data-checked:bg-primary"
                    />
                    <div className="relative size-12 shrink-0 overflow-hidden">
                      {variantImageUrl ? (
                        <Image
                          src={variantImageUrl}
                          alt={variant.title || product.title}
                          className="size-full object-cover"
                          width={48}
                          height={48}
                          unoptimized
                        />
                      ) : (
                        <EmptyImage className="text-[10px]" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-sm font-medium wrap-break-word whitespace-pre-line">
                        {variant.title}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hasDiscount &&
                          variant.discountType === DiscountType.PERCENTAGE && (
                            <Badge className="px-1.5 py-0 text-[10px]">
                              {t('discountPercent', {
                                percent: variant.discountAmount ?? 0,
                              })}
                            </Badge>
                          )}
                        {hasPoint && (
                          <Badge className="px-1.5 py-0 text-[10px]">
                            {t('plusPoints', { points: variant.pointsAmount })}
                          </Badge>
                        )}
                      </div>
                      <div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-primary text-sm font-bold">
                              {formatCurrency(netPrice)}
                            </span>
                            <span className="text-muted-foreground text-[10px] line-through">
                              {formatCurrency(variant.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-primary text-sm font-semibold">
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
