'use client'

import Link from 'next/link'

import { getRemainingStock } from '@/utils/cart'
import { ChevronLeftIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

import { CartItemCard } from '../_components/cart/CartItemCard'
import { StoreLayout } from '../_components/layout/Layout'
import { useCartStore } from './store'

export default function StoreCartPage() {
  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full grid-cols-12 items-start gap-5">
          <div className="sticky top-40 col-span-7 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Link href={'/'}>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary -ml-4"
                >
                  <ChevronLeftIcon />
                  <span>แก้ไขรายการสินค้า</span>
                </Button>
              </Link>
            </div>

            <div className="flex flex-col rounded-xl border border-gray-100">
              <div className="rounded-xl bg-gray-100 px-5 py-2.5 text-start font-bold">
                <h2>ตะกร้าสินค้า</h2>
              </div>

              <div className="space-y-8 p-5 text-start">
                {items.map((item) => {
                  return (
                    <CartItemCard
                      key={item.cartItemId}
                      item={item}
                      onRemove={removeItem}
                      onUpdateQuantity={updateQuantity}
                      isMaxStock={
                        item.quantity >=
                        getRemainingStock(items, {
                          variantId: item.variant.variantId,
                          stock: item.variant.stock ?? 0,
                          excludeCartItemId: item.cartItemId,
                        })
                      }
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="sticky top-40 col-span-5 h-96 rounded-xl bg-gray-100"></div>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
