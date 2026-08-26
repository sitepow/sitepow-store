/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { CartItem } from '@/types/sites/cart'
import { formatCurrency } from '@/utils/pricing'
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { EmptyImage } from '../../EmptyImage'

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity?: (id: string, newQuantity: number) => void
  onRemove?: (id: string) => void
  isMaxStock?: boolean
  productClassName?: string
  textClassName?: string
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  isMaxStock = false,
  productClassName,
  textClassName,
}: CartItemCardProps) {
  const hasDiscount = item.variant.discountActive
  const originalUnitPrice = item.variant.price

  return (
    <div className="flex gap-3 border-b py-3 last:border-0 sm:gap-4">
      <div
        className={
          'border-primary relative aspect-square size-16 flex-none cursor-pointer overflow-hidden border border-dashed p-1 md:size-20'
        }
      >
        {item.image ? (
          <img
            src={item.image}
            className="size-full object-cover object-center"
          />
        ) : (
          <EmptyImage className="text-[10px]" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className={cn('min-w-0 wrap-break-word', productClassName)}>
          <h4
            className={cn(
              'text-sm leading-tight font-medium wrap-break-word sm:text-base',
              textClassName,
            )}
          >
            {item.productTitle}
          </h4>
          <p
            className={cn(
              'text-primary mt-0.5 text-[11px] wrap-break-word sm:text-xs',
              textClassName,
            )}
          >
            {item.variant.title}
            {item.selectedOptions.length > 0 &&
              ` | ${item.selectedOptions.map((o) => o.choiceName).join(', ')}`}
            , {item.branchName}{' '}
            {item.selectedAddons.length > 0 &&
              `+ ${item.selectedAddons.map((a) => a.title).join(', ')}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          {onUpdateQuantity && (
            <div className="flex items-center gap-1 rounded-lg border p-0.5 shadow-sm sm:gap-1.5 sm:p-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 sm:size-8"
                onClick={() =>
                  onUpdateQuantity(
                    item.cartItemId,
                    Math.max(1, item.quantity - 1),
                  )
                }
              >
                <MinusIcon className="size-3" />
              </Button>
              <span className="w-6 text-center text-xs font-semibold sm:w-8 sm:text-sm">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 sm:size-8"
                disabled={isMaxStock}
                onClick={() =>
                  onUpdateQuantity(item.cartItemId, item.quantity + 1)
                }
              >
                <PlusIcon className="size-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-muted-foreground text-xs line-through sm:text-sm">
                  {formatCurrency(originalUnitPrice * item.quantity)}
                </span>
              )}
              <p className="text-primary text-sm font-bold sm:text-base">
                {formatCurrency(item.totalPrice)}
              </p>
            </div>
            {onRemove && (
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive size-7"
                onClick={() => onRemove(item.cartItemId)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
