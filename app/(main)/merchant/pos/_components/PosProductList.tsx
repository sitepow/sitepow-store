'use client'

import { useState } from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { SectionProductItem } from '@/actions/storefront/sections'
import { ProductCard } from '@/app/sites/[domain]/_components/product/ProductCard'
import { formatCurrency } from '@/utils/pricing'
import { IconSearch } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PosProductListProps {
  products: POSProductItem[]
  search: string
  onSearchChange: (val: string) => void
  onAddToCart: (product: POSProductItem, variantId: string) => void
}

export function PosProductList({
  products,
  search,
  onSearchChange,
  onAddToCart,
}: PosProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<POSProductItem | null>(
    null,
  )

  const handleProductClick = (product: POSProductItem) => {
    if (product.variants.length === 1) {
      onAddToCart(product, product.variants[0].id)
      return
    }
    setSelectedProduct(product)
  }

  const handleVariantSelect = (variantId: string) => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, variantId)
      setSelectedProduct(null)
    }
  }

  const getVariantStock = (variant: POSProductItem['variants'][number]) => {
    return variant.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0)
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
          autoFocus
        />
      </div>
      <ScrollArea className="h-fit w-full pr-4 xl:h-[calc(100vh-220px)]">
        {products.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            ไม่พบสินค้า
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + getVariantStock(v),
                0,
              )

              return (
                <ProductCard
                  key={product.id}
                  className="text-center"
                  onClick={() => totalStock > 0 && handleProductClick(product)}
                  variant="outline"
                  product={product as unknown as SectionProductItem}
                />
              )
            })}
          </div>
        )}
      </ScrollArea>
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent showCloseButton={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {selectedProduct?.variants.map((variant) => {
              const variantStock = getVariantStock(variant)

              return (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="flex h-auto w-full justify-between py-3"
                  disabled={variantStock === 0}
                  onClick={() => handleVariantSelect(variant.id)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{variant.title}</span>
                    <span className="text-muted-foreground text-xs">
                      คงเหลือ: {variantStock} | SKU: {variant.sku ?? '-'}
                    </span>
                  </div>
                  <span className="text-primary font-bold">
                    {formatCurrency(Number(variant.price))}
                  </span>
                </Button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
