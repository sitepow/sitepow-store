'use client'

import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'
import { DiscountType } from '@/generated/prisma/enums'
import { formatNumber } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'
import { IconCheck } from '@tabler/icons-react'

import { ProductImage } from '@/components/ProductImage'

import { cn } from '@/lib/utils'

interface PosVariantSelectorProps {
  variants: POSProductItem['variants']
  selectedVariantId: string
  onSelectVariant: (id: string) => void
  getVariantStock: (variant: POSProductItem['variants'][number]) => number
  formatCurrency: (val: number) => string
}

export function PosVariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  getVariantStock,
  formatCurrency,
}: PosVariantSelectorProps) {
  const t = useTranslations('merchant.pos')

  if (variants.length <= 1) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {t('variantsAndOptions')}
        </span>
        <span className="text-muted-foreground text-xs">
          {variants.length} รายการ
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id
          const stock = getVariantStock(variant)
          const isOutOfStock = stock <= 0

          const discountConfig =
            variant.discountActive && variant.discountType
              ? {
                  active: true,
                  type: variant.discountType as DiscountType,
                  amount: variant.discountAmount ?? 0,
                }
              : undefined

          const variantPrice = Number(variant.price)
          const netPrice = calculateNetPrice({
            price: variantPrice,
            discount: discountConfig,
          })
          const hasDiscount = !!discountConfig && netPrice < variantPrice
          const variantThumb = variant.image

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(variant.id)}
              className={cn(
                'relative flex flex-col justify-between rounded-lg border p-2.5 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary shadow-2xs'
                  : isOutOfStock
                    ? 'border-border/60 bg-muted/20 cursor-not-allowed border-dashed opacity-40 grayscale'
                    : 'border-border/70 bg-card hover:border-border hover:bg-muted/30 text-foreground',
              )}
            >
              <div className="flex w-full items-center justify-between gap-1.5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {variantThumb && (
                    <div className="border-border/60 size-6 shrink-0 overflow-hidden rounded border">
                      <ProductImage
                        src={variantThumb}
                        alt={variant.title}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <span
                    className={cn(
                      'line-clamp-1 text-xs font-semibold',
                      isSelected ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {variant.title}
                  </span>
                </div>

                {isSelected && (
                  <IconCheck className="text-primary size-3.5 shrink-0 stroke-[2.5]" />
                )}
              </div>

              <div className="mt-2 flex w-full items-baseline justify-between gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-foreground text-xs font-bold">
                    {formatCurrency(netPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-muted-foreground text-[10px] line-through">
                      {formatCurrency(variantPrice)}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-[10px]',
                    isOutOfStock
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground',
                  )}
                >
                  {isOutOfStock ? t('outOfStock') : `${formatNumber(stock)}`}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

