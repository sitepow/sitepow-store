'use client'

import { POSProductItem } from '@/actions/pos/product'
import { Skeleton } from '@/components/ui/skeleton'
import { CartItem } from '@/types/sites/cart'

import { DigitalPriceDisplay } from './DigitalPriceDisplay'
import { PosCart } from './PosCart'
import { PosProductList } from './PosProductList'
import {
  SelectedAddonPayload,
  SelectedOptionPayload,
} from './PosProductOptionDialog'

interface PosQuickCheckoutViewProps {
  products: POSProductItem[]
  cartItems: CartItem[]
  isProductsLoading: boolean
  search: string
  onSearchChange: (search: string) => void
  onAddToCart: (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity?: number,
  ) => void
  selectedStoreId: string
  selectedBranchId: string
  resellerAgreementId?: string
  grandTotal: number
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  removeItem: (id: string) => void
}

export function PosQuickCheckoutView({
  products,
  cartItems,
  isProductsLoading,
  search,
  onSearchChange,
  onAddToCart,
  selectedStoreId,
  selectedBranchId,
  resellerAgreementId,
  grandTotal,
  updateQuantity,
  clearCart,
  removeItem,
}: PosQuickCheckoutViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7 xl:col-span-8">
        {isProductsLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <PosProductList
            products={products}
            cartItems={cartItems}
            search={search}
            onSearchChange={onSearchChange}
            onAddToCart={onAddToCart}
          />
        )}
      </div>
      <div className="flex flex-col gap-5 lg:col-span-5 xl:col-span-4">
        <DigitalPriceDisplay value={grandTotal} size="md" />
        <PosCart
          cart={cartItems}
          storeId={selectedStoreId}
          branchId={selectedBranchId}
          agreementId={resellerAgreementId}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onRemoveItem={removeItem}
        />
      </div>
    </div>
  )
}

