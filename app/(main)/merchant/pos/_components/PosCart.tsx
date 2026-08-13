'use client'

import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import Image from 'next/image'

import { useStorefrontLoyalty } from '@/actions/hooks/storefront/discount'
import { CartItemCard } from '@/app/sites/[domain]/_components/cart/_components/CartItemCard'
import { CartSummary } from '@/app/sites/[domain]/_components/cart/_components/CartSummary'
import { FALLBACK_MERCHANT_BANNER_IMAGE } from '@/constants/system'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CartItem } from '@/types/sites/cart'
import {
  calculateCartSummary,
  calculateGrandTotal,
  getRemainingStock,
} from '@/utils/cart'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'
import { POSCheckoutInput, posCheckoutSchema } from '@/zod/order'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconShoppingCart, IconTrash, IconX } from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
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

interface PosCartProps {
  cart: CartItem[]
  storeId: string
  branchId: string
  storeSlug?: string
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
  onRemoveItem: (cartItemId: string) => void
  onClearCart: () => void
  bgImage?: string
}

export function PosCart({
  cart,
  storeId,
  branchId,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  bgImage = FALLBACK_MERCHANT_BANNER_IMAGE,
}: PosCartProps) {
  const { selectedStoreSlug } = useStoreFilter()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { data: loyalty } = useStorefrontLoyalty(selectedStoreSlug)

  const orderItems = useMemo(
    () =>
      cart.map((item) => ({
        productId: item.productId,
        variantId: item.variant.id,
        title: item.productTitle,
        variantTitle: item.variant.title,
        quantity: item.quantity,
        price: item.unitPrice,
        originalPrice: item.originalPrice ?? item.unitPrice,
        productType: item.productType,
        rewardPoints: item.rewardPoints ?? 0,
      })),
    [cart],
  )

  const methods = useForm<POSCheckoutInput>({
    resolver: zodResolver(posCheckoutSchema),
    defaultValues: {
      storeId,
      branchId,
      usedPoints: 0,
      couponDiscount: 0,
      discountAmount: 0,
      status: OrderStatus.SHIPPED,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      items: orderItems,
    },
  })

  const { watch, setValue, reset } = methods

  useEffect(() => {
    setValue('storeId', storeId)
    setValue('branchId', branchId)
    setValue('items', orderItems)
  }, [storeId, branchId, orderItems, setValue])

  const customerId = watch('customerId')
  const customerName = watch('customerName')
  const customerPhone = watch('customerPhone')
  const customerPoints = watch('customerPoints') || 0

  const usedPoints = watch('usedPoints') || 0
  const couponDiscount = watch('couponDiscount') || 0
  const manualDiscount = watch('discountAmount') || 0

  const cartSummary = useMemo(() => calculateCartSummary(cart), [cart])

  const pointsDiscount = usedPoints * (loyalty?.pointRedeemRate ?? 0)
  const orderDiscount = couponDiscount + manualDiscount

  const grandTotal = useMemo(() => {
    return calculateGrandTotal({
      subtotal: cartSummary.finalPrice,
      pointsDiscount,
      couponDiscount: orderDiscount,
    })
  }, [cartSummary.finalPrice, pointsDiscount, orderDiscount])

  const totalItems = cartSummary.totalQuantity

  const summaryData = useMemo(() => {
    return {
      subtotal: cartSummary.subtotal,
      productDiscount: cartSummary.totalDiscount,
      couponDiscount,
      manualDiscount,
      pointsDiscount,
      totalDiscount: cartSummary.totalDiscount + pointsDiscount + orderDiscount,
      finalPrice: grandTotal,
      totalPoints: cartSummary.totalPoints,
    }
  }, [
    cartSummary,
    couponDiscount,
    manualDiscount,
    pointsDiscount,
    orderDiscount,
    grandTotal,
  ])

  const handleClearCartAll = () => {
    onClearCart()
    reset({
      storeId,
      branchId,
      usedPoints: 0,
      couponDiscount: 0,
      discountAmount: 0,
      items: [],
    })
  }

  const handleRemoveCustomer = () => {
    setValue('customerId', undefined)
    setValue('customerName', undefined)
    setValue('customerPhone', undefined)
    setValue('customerPoints', 0)
    setValue('usedPoints', 0)
  }

  return (
    <FormProvider {...methods}>
      <Card className="relative flex flex-col overflow-hidden border-0 bg-neutral-900 **:text-white!">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bgImage || FALLBACK_MERCHANT_BANNER_IMAGE}
            alt="cart-background"
            fill
            className="object-cover opacity-40"
          />
        </div>
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
                    variant="outline"
                    size="sm"
                    className="dark"
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
            {customerId && (
              <CustomerCard
                className="dark from-primary"
                title="ข้อมูลลูกค้า"
                content={
                  <>
                    รหัสลูกค้า: {customerId} <br />
                    เบอร์โทรศัพท์: {formatPromptPay(customerPhone || '')} <br />
                    แต้มคงเหลือ: {formatNumber(customerPoints)} แต้ม
                  </>
                }
                action={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveCustomer}
                  >
                    <IconX />
                  </Button>
                }
              />
            )}
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
                        textClassName="sm:max-w-1/2 lg:max-w-full"
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
          <CardFooter className="flex-col gap-3 border-t border-white/10 p-4">
            {orderItems?.length !== 0 && (
              <PosDiscountDialog subtotal={cartSummary.finalPrice} />
            )}
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
        totalAmount={summaryData.finalPrice}
        earnedPoints={cartSummary.totalPoints}
        onSuccess={handleClearCartAll}
      />
    </FormProvider>
  )
}
