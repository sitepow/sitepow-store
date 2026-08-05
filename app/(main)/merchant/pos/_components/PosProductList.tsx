'use client'

import { useState } from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { SectionProductItem } from '@/actions/storefront/sections'
import { ProductCard } from '@/app/sites/[domain]/_components/product/ProductCard'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { getRemainingStock } from '@/utils/cart'
import { IconSearch } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
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
}

export function PosProductList({
  products,
  cartItems = [],
  search,
  onSearchChange,
  onAddToCart,
}: PosProductListProps) {
  const { selectedBranchId } = useBranchFilter()
  const [selectedProduct, setSelectedProduct] = useState<POSProductItem | null>(
    null,
  )

  const getVariantAvailableStock = (
    variant: POSProductItem['variants'][number],
  ) => {
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
      (sum, v) => sum + getVariantAvailableStock(v),
      0,
    )
  }

  const handleProductClick = (product: POSProductItem) => {
    const hasMultipleVariants = product.variants.length > 1
    const hasOptions = (product.options?.length ?? 0) > 0
    const hasAddons = (product.addons?.length ?? 0) > 0

    const singleVariantStock =
      product.variants.length > 0
        ? getVariantAvailableStock(product.variants[0])
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
            title="ขออภัยครับ"
            description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const totalStock = getProductTotalStock(product)

              return (
                <ProductCard
                  key={product.id}
                  className="text-center"
                  onClick={() => handleProductClick(product)}
                  variant="outline"
                  product={product as unknown as SectionProductItem}
                  quantity={totalStock}
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
