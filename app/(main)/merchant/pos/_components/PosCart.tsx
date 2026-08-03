'use client'

import { useMemo, useState } from 'react'

import { CartItem } from '@/types/sites/cart'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency } from '@/utils/pricing'
import {
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { PosCheckoutModal } from './PosCheckoutModal'

interface PosCartProps {
  cart: CartItem[]
  storeId: string
  branchId: string
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
  onClearCart: () => void
  bgImage?: string
}

export function PosCart({
  cart,
  storeId,
  branchId,
  onUpdateQuantity,
  onClearCart,
  bgImage = '/images/hero-section/section-5.jpeg',
}: PosCartProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const summary = useMemo(() => {
    return calculateOrderSummary({
      items: cart.map((i) => ({ price: i.unitPrice, quantity: i.quantity })),
      totalAmount: cart.reduce((sum, i) => sum + i.totalPrice, 0),
    })
  }, [cart])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Card
        className="relative flex h-[calc(100vh-140px)] flex-col overflow-hidden bg-cover bg-center shadow-sm transition-all"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        {bgImage && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        )}
        <div className="relative z-10 flex h-full flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg text-white">
              <div className="flex items-center gap-2">
                <IconShoppingCart className="size-5 text-white" />
                ตะกร้าสินค้า
              </div>
              <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-bold">
                {totalItems}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-neutral-300">
                  <IconShoppingCart className="size-10 opacity-30" />
                  ยังไม่มีสินค้าในตะกร้า
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-2">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur-md"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="line-clamp-2 text-sm leading-none font-medium text-white">
                          {item.productTitle}
                        </p>
                        <p className="text-xs text-neutral-300">
                          {item.variant.title !== 'Default' &&
                            item.variant.title}
                        </p>
                        <p className="text-primary text-sm font-semibold">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center rounded-md border border-white/20 bg-black/40">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none text-white hover:bg-white/20 hover:text-white"
                            onClick={() =>
                              onUpdateQuantity(
                                item.cartItemId,
                                item.quantity - 1,
                              )
                            }
                          >
                            {item.quantity === 1 ? (
                              <IconTrash className="size-3 text-red-400" />
                            ) : (
                              <IconMinus className="size-3" />
                            )}
                          </Button>
                          <span className="w-8 text-center text-sm font-medium text-white">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none text-white hover:bg-white/20 hover:text-white"
                            onClick={() =>
                              onUpdateQuantity(
                                item.cartItemId,
                                item.quantity + 1,
                              )
                            }
                          >
                            <IconPlus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t border-white/10 bg-black/40 p-6 pt-4 backdrop-blur-md">
            <div className="flex w-full flex-col gap-2 text-sm">
              <div className="flex justify-between text-neutral-200">
                <span>ยอดรวม ({totalItems} ชิ้น)</span>
                <span className="font-medium text-white">
                  {formatCurrency(summary.itemsSubtotal)}
                </span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>ส่วนลด</span>
                  <span>-{formatCurrency(summary.couponDiscount)}</span>
                </div>
              )}
              <Separator className="my-2 bg-white/20" />
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white">ยอดสุทธิ</span>
                <span className="text-primary">
                  {formatCurrency(summary.totalAmount)}
                </span>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                disabled={cart.length === 0}
                onClick={onClearCart}
              >
                ยกเลิก
              </Button>
              <Button
                size="lg"
                className="w-full flex-2 text-base font-bold shadow-md transition-transform hover:scale-[1.02]"
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                ชำระเงิน {formatCurrency(summary.totalAmount)}
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
        totalAmount={summary.totalAmount}
        discountAmount={summary.couponDiscount}
        onSuccess={onClearCart}
      />
    </>
  )
}
