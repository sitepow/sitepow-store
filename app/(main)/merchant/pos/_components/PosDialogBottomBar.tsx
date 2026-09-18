'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  IconMinus,
  IconPlus,
  IconShoppingCartPlus,
} from '@tabler/icons-react'

interface PosDialogBottomBarProps {
  quantity: number
  totalPrice: number
  currentVariantStock: number
  isInvalidQuantity: boolean
  formatCurrency: (val: number) => string
  onDecrement: () => void
  onIncrement: () => void
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
  onConfirm: () => void
}

export function PosDialogBottomBar({
  quantity,
  totalPrice,
  currentVariantStock,
  isInvalidQuantity,
  formatCurrency,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onClose,
  onConfirm,
}: PosDialogBottomBarProps) {
  const t = useTranslations('merchant.pos')
  const isCurrentOutOfStock = currentVariantStock <= 0

  return (
    <div className="border-border/70 bg-muted/15 border-t px-5 py-3.5 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <div className="border-border/80 bg-background flex h-10 items-center rounded-lg border shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-9 rounded-md disabled:opacity-30"
              onClick={onDecrement}
              disabled={quantity <= 1 || isCurrentOutOfStock}
            >
              <IconMinus className="size-4" />
            </Button>
            <input
              type="number"
              min={1}
              max={currentVariantStock > 0 ? currentVariantStock : 1}
              value={quantity}
              onChange={onQuantityChange}
              disabled={isCurrentOutOfStock}
              className="text-foreground w-11 [appearance:textfield] bg-transparent text-center text-sm font-semibold outline-none sm:w-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-9 rounded-md disabled:opacity-30"
              onClick={onIncrement}
              disabled={
                quantity >= currentVariantStock || isCurrentOutOfStock
              }
            >
              <IconPlus className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col items-end sm:hidden">
            <span className="text-muted-foreground text-[10px]">
              {quantity} ชิ้น
            </span>
            <span className="text-foreground text-base font-bold tracking-tight">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden flex-col items-end justify-center pr-2 text-right sm:flex">
            <span className="text-muted-foreground text-[11px]">
              รวม {quantity} ชิ้น
            </span>
            <span className="text-foreground text-base font-bold tracking-tight">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-4 text-xs font-medium sm:text-sm"
            onClick={onClose}
          >
            {t('cart.cancel')}
          </Button>

          <Button
            className="h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold shadow-xs sm:min-w-44 sm:flex-initial sm:px-5 sm:text-sm"
            disabled={isInvalidQuantity}
            onClick={onConfirm}
          >
            <IconShoppingCartPlus className="size-4 shrink-0" />
            <span className="truncate">
              {currentVariantStock <= 0
                ? t('outOfStock')
                : quantity > currentVariantStock
                  ? t('insufficientStock')
                  : t('addToCartWithPrice', {
                      price: formatCurrency(totalPrice),
                    })}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

