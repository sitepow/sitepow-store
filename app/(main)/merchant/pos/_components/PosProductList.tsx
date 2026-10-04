'use client'

import { useState } from 'react'

import { POSProductItem } from '@/actions/sales/pos-product/actions'
import { SectionProductItem } from '@/actions/storefront/sections/actions'
import { ProductCard } from '@/app/sites/[domain]/_components/product/ProductCard'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { getRemainingStock } from '@/utils/cart/cart-calculation'
import { IconSearch } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  PosProductOptionDialog,
  SelectedAddonPayload,
  SelectedOptionPayload,
} from './PosProductOptionDialog'

export type { SelectedOptionPayload, SelectedAddonPayload }

interface PosProductListProps {
  products: POSProductItem[]
  cartItems?: CartItem[]
  search: string
  onSearchChange: (val: string) => void
  onAddToCart: (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity?: number,
  ) => void
  isReseller?: boolean
}

export function PosProductList({
  products,
  cartItems = [],
  search,
  onSearchChange,
  onAddToCart,
  isReseller = false,
}: PosProductListProps) {
  const { selectedBranchId } = useBranchFilter()
  const [selectedProduct, setSelectedProduct] = useState<POSProductItem | null>(
    null,
  )

  const getVariantAvailableStock = (
    product: POSProductItem,
    variant: POSProductItem['variants'][number],
  ) => {
    if (product.isReseller) {
      const resellerStock = variant.stocks[0]?.quantity ?? 0
      return getRemainingStock(cartItems, {
        variantId: variant.id,
        stock: resellerStock,
      })
    }

    if (!selectedBranchId) {
      return 0
    }

    const branchStock =
      variant.stocks.find((s) => s.branchId === selectedBranchId)?.quantity ?? 0

    return getRemainingStock(cartItems, {
      variantId: variant.id,
      stock: branchStock,
    })
  }

  const getProductTotalStock = (product: POSProductItem) => {
    return product.variants.reduce(
      (sum, v) => sum + getVariantAvailableStock(product, v),
      0,
    )
  }

  const handleProductClick = (product: POSProductItem) => {
    const hasMultipleVariants = product.variants.length > 1
    const hasOptions = (product.options?.length ?? 0) > 0
    const hasAddons = (product.addons?.length ?? 0) > 0

    const singleVariantStock =
      product.variants.length > 0
        ? getVariantAvailableStock(product, product.variants[0])
        : 0

    if (
      !hasMultipleVariants &&
      !hasOptions &&
      !hasAddons &&
      singleVariantStock > 0
    ) {
      onAddToCart(product, product.variants[0].id)
      return
    }

    setSelectedProduct(product)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative">
        <IconSearch className="text-muted-foreground absolute top-2.5 left-3 size-4" />
        <Input
          placeholder="ค้นหาสินค้า, SKU, หรือสแกนบาร์โค้ด..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <ScrollArea>
        {products.length === 0 ? (
          <ActionRequiredAlert
            title="ขออภัย"
            description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const totalStock = getProductTotalStock(product)
              const isItemReseller = product.isReseller ?? isReseller

              return (
                <ProductCard
                  key={`${isItemReseller ? 'reseller' : 'own'}-${product.id}`}
                  className="text-center"
                  onClick={() => handleProductClick(product)}
                  product={product as unknown as SectionProductItem}
                  quantity={totalStock}
                  isReseller={isItemReseller}
                />
              )
            })}
          </div>
        )}
      </ScrollArea>
      {selectedProduct && (
        <PosProductOptionDialog
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={onAddToCart}
        />
      )}
    </div>
  )
}
