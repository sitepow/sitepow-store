'use client'

import { useTranslations } from 'next-intl'

import type { TableCartItem } from '@/types/restaurant'
import { formatCurrency } from '@/utils/pricing'
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TableCartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: TableCartItem[]
  onUpdateQuantity: (tempId: string, delta: number) => void
  onRemoveItem: (tempId: string) => void
  onClearCart: () => void
  kitchenNote: string
  onKitchenNoteChange: (note: string) => void
  onSubmitOrder: () => void
  isSubmitting: boolean
}

export function TableCartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  kitchenNote,
  onKitchenNoteChange,
  onSubmitOrder,
  isSubmitting,
}: TableCartDrawerProps) {
  const t = useTranslations('storefront.tableOrder')
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle>{t('cartDrawer.title')}</DialogTitle>
            {cart.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 text-xs"
                onClick={onClearCart}
              >
                {t('cartDrawer.clear')}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 divide-y overflow-y-auto py-2">
          {cart.map((item) => (
            <div
              key={item.tempId}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold">{item.title}</h4>
                {item.variantTitle && (
                  <p className="text-muted-foreground text-xs">
                    {item.variantTitle}
                  </p>
                )}
                {item.customerNote && (
                  <p className="text-primary text-xs">★ {item.customerNote}</p>
                )}
                <p className="text-primary text-xs font-bold">
                  {formatCurrency(item.unitPrice * item.quantity)} {t('baht')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-7"
                  onClick={() => onUpdateQuantity(item.tempId, -1)}
                >
                  <IconMinus className="size-3" />
                </Button>
                <span className="min-w-[20px] text-center text-sm font-bold">
                  {item.quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-7"
                  onClick={() => onUpdateQuantity(item.tempId, 1)}
                >
                  <IconPlus className="size-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive size-7"
                  onClick={() => onRemoveItem(item.tempId)}
                >
                  <IconTrash className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="kitchenNote">{t('cartDrawer.kitchenNote')}</Label>
            <Textarea
              id="kitchenNote"
              placeholder={t('cartDrawer.kitchenNotePlaceholder')}
              value={kitchenNote}
              onChange={(e) => onKitchenNoteChange(e.target.value)}
              rows={2}
              className="resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-between text-base font-bold">
            <span>{t('cartDrawer.subtotal')}</span>
            <span className="text-primary">
              {formatCurrency(cartTotal)} {t('baht')}
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              {t('dialog.cancel')}
            </Button>
            <Button
              onClick={onSubmitOrder}
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting
                ? t('cartDrawer.submitting')
                : t('cartDrawer.submit')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
