import { CartItem } from '@/types/sites/cart'
import { formatCurrency } from '@/utils/pricing'
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity?: (id: string, newQuantity: number) => void
  onRemove?: (id: string) => void
  isMaxStock?: boolean
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  isMaxStock = false,
}: CartItemCardProps) {
  return (
    <div
      key={item.cartItemId}
      className="flex flex-col gap-3 border-b py-3 last:border-0 sm:flex-row sm:gap-4"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-gray-100 sm:size-24" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm leading-tight font-medium sm:text-base">
              {item.productTitle}
            </h4>

            <p className="text-muted-foreground mt-1 text-[11px] sm:text-xs">
              {item.variant.title}
              {item.selectedOptions.length > 0 &&
                ` | ${item.selectedOptions.map((option) => option.choiceName).join(', ')}`}
            </p>

            {item.selectedAddons.length > 0 && (
              <p className="text-primary mt-0.5 text-[10px] sm:text-[11px]">
                + {item.selectedAddons.map((addon) => addon.title).join(', ')}
              </p>
            )}
          </div>

          {onRemove && (
            <Button
              size="icon"
              onClick={() => onRemove(item.cartItemId)}
              variant="destructive"
              className="size-8 shrink-0"
            >
              <Trash2Icon className="size-4" />
            </Button>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <div className="flex items-center gap-1 rounded-lg border p-0.5 shadow-sm sm:gap-2 sm:p-1">
            {onUpdateQuantity && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 h-7 w-7 sm:size-8"
                onClick={() =>
                  onUpdateQuantity(
                    item.cartItemId,
                    Math.max(1, item.quantity - 1),
                  )
                }
              >
                <MinusIcon className="size-3" />
              </Button>
            )}

            <span className="w-6 text-center text-xs font-semibold sm:w-8 sm:text-sm">
              {item.quantity}
            </span>

            {onUpdateQuantity && (
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
            )}
          </div>

          <p className="ml-2 text-right text-sm font-bold sm:ml-0 sm:text-base">
            {formatCurrency(item.totalPrice)}
          </p>
        </div>
      </div>
    </div>
  )
}
