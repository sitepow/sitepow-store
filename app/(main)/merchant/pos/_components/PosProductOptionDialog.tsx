'use client'

import React from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { CartItem } from '@/types/sites/cart'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import {
  SelectedAddonPayload,
  SelectedOptionPayload,
  usePosProductOptions,
} from '../_hooks/use-pos-product-options'
import { PosAddonsSelector } from './PosAddonsSelector'
import { PosDialogBottomBar } from './PosDialogBottomBar'
import { PosOptionChoicesSelector } from './PosOptionChoicesSelector'
import { PosOptionHeader } from './PosOptionHeader'
import { PosVariantSelector } from './PosVariantSelector'

export type { SelectedAddonPayload, SelectedOptionPayload }

interface PosProductOptionDialogProps {
  product: POSProductItem | null
  cartItems?: CartItem[]
  onClose: () => void
  onConfirm: (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity?: number,
  ) => void
}

export function PosProductOptionDialog({
  product,
  cartItems = [],
  onClose,
  onConfirm,
}: PosProductOptionDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()

  const {
    selectedVariantId,
    setSelectedVariantId,
    selectedOptions,
    selectedAddonIds,
    quantity,
    currentVariant,
    currentVariantStock,
    currentVariantHasDiscount,
    rawVariantPrice,
    unitPrice,
    isInvalidQuantity,
    getVariantAvailableStock,
    handleOptionChange,
    handleAddonToggle,
    handleQuantityChange,
    handleIncrement,
    handleDecrement,
    handleConfirmAddToCart,
  } = usePosProductOptions({
    product,
    cartItems,
    onClose,
    onConfirm,
  })

  if (!product) {
    return null
  }

  const totalPrice = unitPrice * quantity
  const activeImageUrl = currentVariant?.image || product.images?.[0]?.url

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <PosOptionHeader
          product={product}
          activeImageUrl={activeImageUrl}
          currentVariant={currentVariant}
          currentVariantStock={currentVariantStock}
          currentVariantHasDiscount={currentVariantHasDiscount}
          unitPrice={unitPrice}
          rawVariantPrice={rawVariantPrice}
          formatCurrency={formatCurrency}
        />

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:space-y-5">
          <PosVariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onSelectVariant={setSelectedVariantId}
            getVariantStock={getVariantAvailableStock}
            formatCurrency={formatCurrency}
          />

          <PosOptionChoicesSelector
            options={product.options}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
            formatCurrency={formatCurrency}
          />

          <PosAddonsSelector
            addons={product.addons}
            selectedAddonIds={selectedAddonIds}
            onToggleAddon={handleAddonToggle}
            formatCurrency={formatCurrency}
          />
        </div>

        <PosDialogBottomBar
          quantity={quantity}
          totalPrice={totalPrice}
          currentVariantStock={currentVariantStock}
          isInvalidQuantity={isInvalidQuantity}
          formatCurrency={formatCurrency}
          onDecrement={handleDecrement}
          onIncrement={handleIncrement}
          onQuantityChange={handleQuantityChange}
          onClose={onClose}
          onConfirm={handleConfirmAddToCart}
        />
      </DialogContent>
    </Dialog>
  )
}
