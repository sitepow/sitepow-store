'use client'

import { useState } from 'react'

import Link from 'next/link'

import { getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import {
  IconCreditCard,
  IconMapPin,
  IconShoppingCartCheck,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { ChevronLeftIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { CircularProgress } from '../_components/CircularProgress'
import { CartItemCard } from '../_components/cart/CartItemCard'
import { CartSummary } from '../_components/cart/CartSummary'
import { StoreLayoutLite } from '../_components/layout/lite/LayoutLite'
import { CheckoutSection } from './_components/CheckoutSection'
import { CustomerAddressForm } from './_components/CustomerAddressForm'
import { useCartStore } from './store'

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export default function StoreCartPage() {
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<CheckoutStep>('address')
  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  const stepIcons = {
    address: IconMapPin,
    shipping: IconTruckDelivery,
    payment: IconCreditCard,
    review: IconShoppingCartCheck,
  }

  const shippingMethods = [
    {
      id: 'standard',
      title: 'Standard Delivery',
      description: 'จัดส่งด่วนภายใน 2-3 วันทำการ',
      price: 40,
    },
    {
      id: 'express',
      title: 'Express Delivery',
      description: 'จัดส่งด่วนพิเศษภายใน 1 วัน',
      price: 80,
    },
  ]

  const paymentMethods = [
    {
      id: 'qr',
      title: 'Thai QR Payment',
      description: 'สแกนผ่าน Mobile Banking ทุกธนาคาร',
    },
    {
      id: 'credit',
      title: 'บัตรเครดิต / บัตรเดบิต',
      description: 'ชำระผ่านบัตร Visa, Mastercard',
    },
    {
      id: 'transfer',
      title: 'โอนเงินผ่านบัญชีธนาคาร',
      description: 'แจ้งโอนเงินผ่านระบบหลังชำระ',
    },
  ]

  const stepsOrder: CheckoutStep[] = [
    'address',
    'shipping',
    'payment',
    'review',
  ]
  const progressValue = ((stepsOrder.indexOf(activeSection) + 1) / 4) * 100

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
                {items.map((item) => (
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
                ))}
              </div>
            </div>
          </div>

          <div className="sticky top-28 col-span-5 space-y-4">
            <div className="shadow-airy flex items-center gap-5 rounded-xl px-5 py-2.5 text-start">
              <CircularProgress
                size={60}
                value={progressValue}
                icon={stepIcons[activeSection]}
              />
              <div className="space-y-0.5">
                <h3 className="font-bold" suppressHydrationWarning>
                  ยอดที่ต้องชำระ: {formatCurrency(summary.finalPrice)}
                </h3>
                <p className="text-xs opacity-50">เลือกที่อยู่การจัดส่ง</p>
              </div>
            </div>

            <CheckoutSection
              title="1. ที่อยู่สำหรับการจัดส่ง"
              isActive={activeSection === 'address'}
              isCompleted={activeSection !== 'address'}
              onEdit={() => setActiveSection('address')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    เลือกที่อยู่ที่ต้องการให้จัดส่ง
                  </span>
                  <CustomerAddressForm />
                </div>
                <div className="text-muted-foreground flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-100 text-sm">
                  ยังไม่ได้เลือกที่อยู่
                </div>
                <Button
                  className="w-full"
                  onClick={() => setActiveSection('shipping')}
                >
                  ดำเนินการต่อ
                </Button>
              </div>
              <div className="text-sm">
                <p className="font-medium">คุณสมชาย สายเสมอ</p>
                <p className="text-muted-foreground text-xs">
                  123/45 หมู่บ้านตัวอย่าง ถ.สุขุมวิท กรุงเทพฯ 10110
                </p>
              </div>
            </CheckoutSection>

            <CheckoutSection
              title="2. เลือกช่องทางจัดส่ง"
              isActive={activeSection === 'shipping'}
              isCompleted={stepsOrder.indexOf(activeSection) > 1}
              onEdit={() => setActiveSection('shipping')}
            >
              <div className="space-y-4">
                <div className="grid gap-2">
                  {shippingMethods.map((method) => {
                    const isSelected = selectedShipping === method.id
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedShipping(method.id)}
                        className={cn(
                          'cursor-pointer rounded-xl border p-4 text-start transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-primary'
                            : 'border-gray-200 bg-white hover:border-gray-300',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={cn(
                                'text-sm font-bold',
                                isSelected ? 'text-primary' : 'text-gray-700',
                              )}
                            >
                              {method.title} ({formatCurrency(method.price)})
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {method.description}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                              isSelected ? 'border-primary' : 'border-gray-300',
                            )}
                          >
                            {isSelected && (
                              <div className="bg-primary size-2.5 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Button
                  className="w-full"
                  onClick={() => setActiveSection('payment')}
                >
                  ดำเนินการต่อ
                </Button>
              </div>
              <div className="text-sm font-medium">
                Standard Delivery (฿40.00)
              </div>
            </CheckoutSection>

            <CheckoutSection
              title="3. วิธีชำระเงิน"
              isActive={activeSection === 'payment'}
              isCompleted={!!selectedPayment && activeSection !== 'payment'}
              onEdit={() => setActiveSection('payment')}
            >
              <div className="space-y-3">
                <div className="grid gap-2">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPayment === method.id
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={cn(
                          'cursor-pointer rounded-xl border p-4 text-start transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-primary'
                            : 'border-gray-200 bg-white hover:border-gray-300',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={cn(
                                'text-sm font-bold',
                                isSelected ? 'text-primary' : 'text-gray-700',
                              )}
                            >
                              {method.title}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {method.description}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                              isSelected ? 'border-primary' : 'border-gray-300',
                            )}
                          >
                            {isSelected && (
                              <div className="bg-primary size-2.5 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Button
                  className="mt-2 h-11 w-full"
                  disabled={!selectedPayment}
                  onClick={() => setActiveSection('review')}
                >
                  ดำเนินการต่อ
                </Button>
              </div>
              <div className="text-sm font-medium">
                {paymentMethods.find((p) => p.id === selectedPayment)?.title ||
                  'ยังไม่ได้เลือก'}
              </div>
            </CheckoutSection>

            <div className="shadow-airy rounded-xl border border-gray-100 bg-white p-5">
              <CartSummary summary={summary} />
              <Button
                className="mt-6 h-12 w-full text-lg"
                size="lg"
                disabled={activeSection !== 'review'}
              >
                สั่งสินค้า
              </Button>
            </div>
          </div>
        </div>
      </SectionContainer>
    </StoreLayoutLite>
  )
}
