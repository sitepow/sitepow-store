'use client'

import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useStorefrontLoyalty } from '@/actions/storefront/discount/hooks'
import { CartItemCard } from '@/app/sites/[domain]/_components/cart/_components/CartItemCard'
import { CartSummary } from '@/app/sites/[domain]/_components/cart/_components/CartSummary'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { CartItem } from '@/types/cart'
import {
  calculateCartSummary,
  calculateGrandTotal,
  getRemainingStock,
} from '@/utils/cart/cart-calculation'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import { formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { POSCheckoutInput, posCheckoutSchema } from '@/zod/sales/pos-checkout'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconShoppingCart, IconTrash, IconX } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { CustomerCard } from '@/components/customer/CustomerCard'
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
  agreementId?: string
  storeSlug?: string
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
  onRemoveItem: (cartItemId: string) => void
  onClearCart: () => void
}

export function PosCart({
  cart,
  storeId,
  branchId,
  agreementId,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: PosCartProps) {
  const { selectedStoreSlug } = useStoreFilter()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { data: loyalty } = useStorefrontLoyalty(selectedStoreSlug)

  const isResellerMode = Boolean(agreementId)

  const hasMixedProducts = useMemo(() => {
    if (cart.length === 0) {
      return false
    }

    const hasResellerItems = cart.some(
      (item) => item.isReseller || Boolean(item.agreementId),
    )
    const hasOwnItems = cart.some(
      (item) => !item.isReseller && !Boolean(item.agreementId),
    )

    return hasResellerItems && hasOwnItems
  }, [cart])

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
  const customerPhone = watch('customerPhone')
  const customerPoints = watch('customerPoints') || 0

  const usedPoints = watch('usedPoints') || 0
  const couponDiscount = watch('couponDiscount') || 0
  const manualDiscount = watch('discountAmount') || 0

  const cartSummary = useMemo(() => calculateCartSummary(cart), [cart])

  const pointsDiscount = isResellerMode
    ? 0
    : usedPoints * (loyalty?.pointRedeemRate ?? 0)
  const orderDiscount = isResellerMode ? 0 : couponDiscount + manualDiscount

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
      couponDiscount: isResellerMode ? 0 : couponDiscount,
      manualDiscount: isResellerMode ? 0 : manualDiscount,
      pointsDiscount: isResellerMode ? 0 : pointsDiscount,
      totalDiscount: isResellerMode
        ? cartSummary.totalDiscount
        : cartSummary.totalDiscount + pointsDiscount + orderDiscount,
      finalPrice: grandTotal,
      totalPoints: isResellerMode ? 0 : cartSummary.totalPoints,
    }
  }, [
    cartSummary,
    couponDiscount,
    manualDiscount,
    pointsDiscount,
    orderDiscount,
    grandTotal,
    isResellerMode,
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
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <IconShoppingCart className="size-5" />
              <span>ตะกร้าสินค้า</span>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCartAll}
                >
                  <IconTrash className="size-3.5" />
                  ล้างตะกร้า
                </Button>
              )}
              <Button size="icon-sm">{totalItems}</Button>
            </div>
          </CardTitle>
          {!isResellerMode && customerId && (
            <CustomerCard
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
                  <IconX className="size-4" />
                </Button>
              }
            />
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4">
            {cart.length === 0 ? (
              <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 text-sm">
                <IconShoppingCart className="size-10 opacity-30" />
                ยังไม่มีสินค้าในตะกร้า
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-2">
                {hasMixedProducts && (
                  <ActionRequiredAlert
                    title="ไม่สามารถชำระเงินรวมกันได้"
                    description="พบสินค้าตัวแทนจำหน่ายรวมกับสินค้าหน้าร้าน โปรดลบรายการออกเพื่อชำระเงินทีละประเภท"
                  />
                )}

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
        <CardFooter className="flex-col gap-3 border-t p-4">
          {!isResellerMode && orderItems?.length !== 0 && !hasMixedProducts && (
            <PosDiscountDialog subtotal={cartSummary.finalPrice} />
          )}
          <div className="w-full">
            <CartSummary summary={summaryData} />
          </div>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={cart.length === 0}
              onClick={handleClearCartAll}
            >
              ยกเลิก
            </Button>
            <Button
              size="lg"
              className="flex-2 text-base font-semibold"
              disabled={cart.length === 0 || hasMixedProducts}
              onClick={() => setIsCheckoutOpen(true)}
            >
              ชำระเงิน {formatCurrency(summaryData.finalPrice)}
            </Button>
          </div>
        </CardFooter>
      </Card>
      <PosCheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        totalAmount={summaryData.finalPrice}
        earnedPoints={isResellerMode ? 0 : cartSummary.totalPoints}
        agreementId={agreementId}
        onSuccess={handleClearCartAll}
      />
    </FormProvider>
  )
}
