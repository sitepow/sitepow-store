'use client'

import Link from 'next/link'

import { useStoreData } from '@/stores/sites/use-store-data'
import { getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import { ShoppingCartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useCartStore } from '../../cart/store'
import { CartBadge } from './CartBadge'
import { CartItemCard } from './_components/CartItemCard'
import { CartSummary } from './_components/CartSummary'

export function CartDrawer() {
  const { store } = useStoreData()

  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon-lg" className="relative">
          <ShoppingCartIcon className="size-5" />
          {items.length > 0 && <CartBadge total={summary.totalQuantity} />}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="ml-auto h-full w-full max-w-md"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-5" />
            ตะกร้าสินค้า ({summary.totalQuantity})
          </DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="flex-1 overflow-y-scroll px-4">
          {items.length === 0 ? (
            <div className="text-muted-foreground flex h-[60vh] flex-col items-center justify-center gap-2">
              <ShoppingCartIcon className="h-12 w-12 opacity-20" />
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item) => {
                const stock = item.variant.stocks.reduce(
                  (sum, s) => sum + s.quantity,
                  0,
                )
                return (
                  <CartItemCard
                    key={item.cartItemId}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                    isMaxStock={
                      item.quantity >=
                      getRemainingStock(items, {
                        variantId: item.variant.id,
                        stock,
                        excludeCartItemId: item.cartItemId,
                      })
                    }
                  />
                )
              })}
            </div>
          )}
        </ScrollArea>
        {items.length > 0 && (
          <DrawerFooter className="border-t">
            <CartSummary />
            <Link href="/cart">
              <Button
                size="lg"
                className="h-12 w-full text-lg shadow-md sm:text-lg"
              >
                สั่งซื้อสินค้า ({formatCurrency(summary.finalPrice)})
              </Button>
            </Link>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
