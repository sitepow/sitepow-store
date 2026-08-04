'use client'

import { useMemo, useState } from 'react'

import { CartItemCard } from '@/app/sites/[domain]/_components/cart/_components/CartItemCard'
import { CartSummary } from '@/app/sites/[domain]/_components/cart/_components/CartSummary'
import { CartItem } from '@/types/sites/cart'
import { getRemainingStock } from '@/utils/cart'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency } from '@/utils/pricing'
import { IconShoppingCart, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

import { PosCheckoutModal } from './PosCheckoutModal'
import { PosDiscountDialog } from './PosDiscountDialog'

export interface CustomerMember {
  id: string
  name: string
  phone: string
  points: number
}

interface PosCartProps {
  cart: CartItem[]
  storeId: string
  branchId: string
  pointRedeemRate?: number
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
  onRemoveItem: (cartItemId: string) => void
  onClearCart: () => void
  bgImage?: string
}

export function PosCart({
  cart,
  storeId,
  branchId,
  pointRedeemRate = 1,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  bgImage = '/images/hero-section/section-5.jpeg',
}: PosCartProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const [customer, setCustomer] = useState<CustomerMember | null>(null)
  const [usedPoints, setUsedPoints] = useState<number>(0)
  const [couponDiscount, setCouponDiscount] = useState<number>(0)

  const pointsDiscount = usedPoints * pointRedeemRate
  const totalDiscount = couponDiscount + pointsDiscount

  const orderSummary = useMemo(() => {
    const rawSubtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0)
    return calculateOrderSummary({
      items: cart.map((i) => ({ price: i.unitPrice, quantity: i.quantity })),
      totalAmount: Math.max(0, rawSubtotal - totalDiscount),
    })
  }, [cart, totalDiscount])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const summaryData = useMemo(() => {
    return {
      subtotal: orderSummary.itemsSubtotal,
      totalDiscount,
      finalPrice: orderSummary.totalAmount,
      totalPoints: 0,
    }
  }, [orderSummary, totalDiscount])

  const handleResetCustomerAndDiscount = () => {
    setCustomer(null)
    setUsedPoints(0)
    setCouponDiscount(0)
  }

  const handleClearCartAll = () => {
    onClearCart()
    handleResetCustomerAndDiscount()
  }

  return (
    <>
      <Card
        className="relative flex flex-col overflow-hidden bg-cover bg-center shadow-sm transition-all"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        {bgImage && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" />
        )}
        <div className="relative z-10 flex h-full flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg text-white">
              <div className="flex items-center gap-2">
                <IconShoppingCart className="size-5 text-white" />
                ตะกร้าสินค้า
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    onClick={handleClearCartAll}
                  >
                    <IconTrash className="mr-1 size-3.5" />
                    ล้างตะกร้า
                  </Button>
                )}
                <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-bold">
                  {totalItems}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-neutral-300">
                  <IconShoppingCart className="size-10 opacity-30" />
                  ยังไม่มีสินค้าในตะกร้า
                </div>
              ) : (
                <div className="dark flex flex-col gap-2 rounded-lg p-3 text-white!">
                  {cart.map((item) => {
                    const stock = item.variant.stocks.reduce(
                      (sum, s) => sum + s.quantity,
                      0,
                    )
                    const isMaxStock =
                      item.quantity >=
                      getRemainingStock(cart, {
                        variantId: item.variant.id,
                        stock,
                        excludeCartItemId: item.cartItemId,
                      })

                    return (
                      <CartItemCard
                        key={item.cartItemId}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemoveItem}
                        isMaxStock={isMaxStock}
                      />
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-col gap-3 border-t border-white/10 bg-black/60 p-4 backdrop-blur-md">
            <div className="flex w-full items-center justify-between px-1">
              <PosDiscountDialog
                subtotal={summaryData.subtotal}
                customer={customer}
                usedPoints={usedPoints}
                couponDiscount={couponDiscount}
                pointRedeemRate={pointRedeemRate}
                onSelectCustomer={setCustomer}
                onChangeUsedPoints={setUsedPoints}
                onChangeCouponDiscount={setCouponDiscount}
              />
            </div>
            <div className="dark w-full px-4 py-2 text-white!">
              <CartSummary summary={summaryData} />
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                disabled={cart.length === 0}
                onClick={handleClearCartAll}
              >
                ยกเลิก
              </Button>
              <Button
                size="lg"
                className="w-full flex-2 text-base font-bold shadow-md transition-transform hover:scale-[1.01]"
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                ชำระเงิน {formatCurrency(summaryData.finalPrice)}
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
      <PosCheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cart={cart}
        storeId={storeId}
        branchId={branchId}
        customerId={customer?.id}
        usedPoints={usedPoints}
        discountAmount={totalDiscount}
        totalAmount={summaryData.finalPrice}
        onSuccess={handleClearCartAll}
      />
    </>
  )
}
