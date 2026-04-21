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
    <div key={item.cartItemId} className="flex gap-4">
      <div className="relative size-20 overflow-hidden rounded-lg border bg-gray-200" />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <h4 className="line-clamp-1 leading-none font-medium">
              {item.productTitle}
            </h4>
            {onRemove && (
              <button
                onClick={() => onRemove(item.cartItemId)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon className="size-4" />
              </button>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {item.variant.title}
            {item.selectedOptions.length > 0 &&
              ` | ${item.selectedOptions.map((option) => option.choiceName).join(', ')}`}
          </p>
          {item.selectedAddons.length > 0 && (
            <p className="text-primary text-[10px]">
              + {item.selectedAddons.map((addon) => addon.title).join(', ')}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onUpdateQuantity && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() =>
                  onUpdateQuantity(item.cartItemId, item.quantity - 1)
                }
              >
                <MinusIcon className="size-3" />
              </Button>
            )}

            <span className="w-4 text-center text-sm font-medium">
              {item.quantity}
            </span>

            {onUpdateQuantity && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={isMaxStock}
                onClick={() =>
                  onUpdateQuantity(item.cartItemId, item.quantity + 1)
                }
              >
                <PlusIcon className="size-3" />
              </Button>
            )}
          </div>
          <p className="text-sm font-bold">{formatCurrency(item.totalPrice)}</p>
        </div>
      </div>
    </div>
  )
}
