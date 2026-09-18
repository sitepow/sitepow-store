'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import type { TableCartItem, TableMenuProductItem } from '@/types/restaurant'
import { formatCurrency } from '@/utils/pricing'
import { IconMinus, IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TableProductCustomizeModalProps {
  product: TableMenuProductItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: TableCartItem) => void
}

export function TableProductCustomizeModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: TableProductCustomizeModalProps) {
  const t = useTranslations('storefront.tableOrder')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (product) {
      setQuantity(1)
      setNote('')
      setSelectedVariantId(product.variants[0]?.id || '')
    }
  }, [product])

  if (!product) return null

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0]
  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.defaultPrice

  const handleConfirm = () => {
    onAddToCart({
      tempId: `${Date.now()}-${Math.random()}`,
      productId: product.id,
      variantId: selectedVariant?.id || '',
      title: product.title,
      variantTitle: selectedVariant?.title || '',
      unitPrice: currentPrice,
      quantity,
      customerNote: note.trim() || undefined,
      image: selectedVariant?.image || product.image,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          {product.description && (
            <DialogDescription>{product.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <Label>{t('dialog.variant')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    size="sm"
                    variant={
                      selectedVariantId === variant.id ? 'default' : 'outline'
                    }
                    className="h-auto justify-between px-3 py-2 text-xs"
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <span>{variant.title}</span>
                    <span className="font-bold">
                      {formatCurrency(variant.price)} {t('baht')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('dialog.quantity')}</Label>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <IconMinus className="size-4" />
              </Button>
              <span className="min-w-[32px] text-center text-base font-bold">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <IconPlus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemNote">{t('dialog.note')}</Label>
            <Input
              id="itemNote"
              placeholder={t('dialog.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleConfirm}>{t('dialog.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
