'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { ResellerStockItem } from '@/types/reseller'
import { IconPackage } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface AcceptStockPayload {
  agreementId: string
  variantId: string
  quantity: number
}

interface AcceptStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: ResellerStockItem | null
  isLoading?: boolean
  onConfirm: (payload: AcceptStockPayload) => Promise<void> | void
}

export function AcceptStockDialog({
  open,
  onOpenChange,
  stock,
  onConfirm,
  isLoading = false,
}: AcceptStockDialogProps) {
  const t = useTranslations('merchant.reseller.accept')
  const tReseller = useTranslations('merchant.reseller')
  const pendingQuantity = stock
    ? stock.allocatedQuantity - stock.acceptedQuantity
    : 0

  const [quantity, setQuantity] = useState<number>(pendingQuantity)

  useEffect(() => {
    if (stock) {
      setQuantity(stock.allocatedQuantity - stock.acceptedQuantity)
    }
  }, [stock])

  if (!stock) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0 || quantity > pendingQuantity) {
      return
    }

    onConfirm({
      agreementId: stock.agreementId,
      variantId: stock.variantId,
      quantity,
    })
  }

  const productTitle = stock.variant?.product?.title || '-'
  const variantTitle = stock.variant?.title || '-'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogHeaderIcon
              icon={IconPackage}
              title={t('title')}
              description={t('description')}
            />
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm leading-relaxed font-medium wrap-break-word whitespace-pre-line">
                {productTitle}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed wrap-break-word whitespace-pre-line">
                {t('variantPrefix', { variant: variantTitle })}
              </p>
            </div>
            <div className="bg-muted/50 space-y-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('allocated')}</span>
                <span className="font-medium">
                  {tReseller('table.unitPieces', {
                    count: stock.allocatedQuantity,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('accepted')}</span>
                <span className="font-medium">
                  {tReseller('table.unitPieces', {
                    count: stock.acceptedQuantity,
                  })}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t pt-1">
                <span className="font-medium">{t('pending')}</span>
                <span className="font-medium">
                  {tReseller('table.unitPieces', { count: pendingQuantity })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">{t('quantityLabel')}</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={pendingQuantity}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder={t('quantityPlaceholder')}
                required
              />
              <p className="text-muted-foreground text-[0.8rem]">{t('note')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || quantity <= 0 || quantity > pendingQuantity
              }
            >
              {isLoading ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
