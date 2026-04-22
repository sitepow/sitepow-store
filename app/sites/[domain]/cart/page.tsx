'use client'

import Link from 'next/link'

import { getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import { ChevronLeftIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

import { CircularProgress } from '../_components/CircularProgress'
import { CartItemCard } from '../_components/cart/CartItemCard'
import { StoreLayoutLite } from '../_components/layout/lite/LayoutLite'
import { CustomerAddressForm } from './_components/CustomerAddressForm'
import { useCartStore } from './store'

export default function StoreCartPage() {
  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  return (
    <StoreLayoutLite>
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

          <div className="sticky top-28 col-span-5 space-y-5 rounded-xl border border-gray-100 pb-2.5">
            <div className="shadow-airy flex items-center gap-5 rounded-xl px-5 py-2.5 text-start">
              <CircularProgress size={60} value={30} />

              <div className="space-y-0.5">
                <h3 className="font-bold" suppressHydrationWarning>
                  ยอดที่ต้องชำระ: {formatCurrency(summary.finalPrice)}
                </h3>
                <p className="text-xs opacity-50">เลือกที่อยู่การจัดส่ง</p>
              </div>
            </div>

            <div className="space-y-4 px-5 py-2.5">
              <div className="flex justify-between">
                <p className="font-medium">1. เลือกที่อยู่การจัดส่ง</p>

                <CustomerAddressForm />
              </div>

              <div className="flex h-32 w-full items-center justify-center border-2 border-dashed border-gray-100">
                <p>ยังไม่มีที่อยู่สำหรับการจัดส่ง</p>
              </div>

              <Button className="w-full" size="lg">
                จัดส่งตามที่อยู่นี้
              </Button>
            </div>
          </div>
        </div>
      </SectionContainer>
    </StoreLayoutLite>
  )
}
