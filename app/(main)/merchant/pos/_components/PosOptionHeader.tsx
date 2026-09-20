'use client'

import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'
import { DiscountType } from '@/generated/prisma/enums'
import { formatNumber } from '@/utils/pricing'

import { ProductImage } from '@/components/ProductImage'
import { Badge } from '@/components/ui/badge'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

interface PosOptionHeaderProps {
  product: POSProductItem
  activeImageUrl?: string
  currentVariant: POSProductItem['variants'][number] | null
  currentVariantStock: number
  currentVariantHasDiscount: boolean
  unitPrice: number
  rawVariantPrice: number
  formatCurrency: (val: number) => string
}

export function PosOptionHeader({
  product,
  activeImageUrl,
  currentVariant,
  currentVariantStock,
  currentVariantHasDiscount,
  unitPrice,
  rawVariantPrice,
  formatCurrency,
}: PosOptionHeaderProps) {
  const t = useTranslations('merchant.pos')
  const isCurrentOutOfStock = currentVariantStock <= 0

  return (
    <div className="border-border/60 bg-muted/20 relative flex items-center justify-between gap-3 border-b px-5 py-3.5 pr-12">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="border-border/60 bg-muted/40 relative size-12 shrink-0 overflow-hidden rounded-lg border">
          <ProductImage
            src={activeImageUrl}
            alt={product.title}
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <DialogHeader className="gap-0 p-0 text-left">
            <DialogTitle className="text-foreground line-clamp-1 text-base font-semibold tracking-tight">
              {product.title}
            </DialogTitle>
          </DialogHeader>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {currentVariant?.sku && <span>SKU: {currentVariant.sku}</span>}
            {currentVariant?.sku && <span>•</span>}
            <span
              className={cn(
                'font-medium',
                isCurrentOutOfStock
                  ? 'text-destructive font-semibold'
                  : 'text-muted-foreground',
              )}
            >
              {isCurrentOutOfStock
                ? t('outOfStock')
                : t('stockRemaining', {
                    count: formatNumber(currentVariantStock),
                  })}
            </span>

            {currentVariantHasDiscount &&
              currentVariant?.discountType === DiscountType.PERCENTAGE && (
                <Badge
                  variant="secondary"
                  className="h-4.5 border-0 bg-amber-500/10 px-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                >
                  {t('discountBadge', {
                    amount: currentVariant.discountAmount ?? 0,
                  })}
                </Badge>
              )}

            {currentVariant?.pointsActive && (
              <Badge
                variant="secondary"
                className="border-primary/20 bg-primary/10 text-primary h-4.5 px-1.5 text-[10px] font-medium"
              >
                {t('pointsBadge', {
                  amount: currentVariant.pointsAmount ?? 0,
                })}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end pl-2">
        <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">
          {formatCurrency(unitPrice)}
        </span>
        {currentVariantHasDiscount && (
          <span className="text-muted-foreground text-xs line-through">
            {formatCurrency(rawVariantPrice)}
          </span>
        )}
      </div>
    </div>
  )
}
