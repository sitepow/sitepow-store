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

import { CircularProgress } from '../_components/CircularProgress'
import { CartItemCard } from '../_components/cart/CartItemCard'
import { CartSummary } from '../_components/cart/CartSummary'
import { SummaryRow } from '../_components/cart/SummaryRow'
import { StoreLayoutLite } from '../_components/layout/lite/LayoutLite'
import { CheckoutSection } from './_components/CheckoutSection'
import { CustomerAddressForm } from './_components/CustomerAddressForm'
import { DiscountForm } from './_components/DiscountForm'
import { RadioCard } from './_components/RadioCard'
import { useCartStore } from './store'

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export default function StoreCartPage() {
  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<CheckoutStep>('address')

  const stepIcons = {
    address: IconMapPin,
    shipping: IconTruckDelivery,
    payment: IconCreditCard,
    review: IconShoppingCartCheck,
  }

  const addresses = [
    {
      id: 'addr_1',
      title: 'คุณสมชาย สายเสมอ',
      description: '123/45 หมู่บ้านตัวอย่าง ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110',
    },
    {
      id: 'addr_2',
      title: 'คุณสมหญิง จริงใจ (ที่ทำงาน)',
      description: 'อาคารออฟฟิศชั้น 20 ถ.รัชดาภิเษก เขตห้วยขวาง กรุงเทพฯ 10310',
    },
  ]

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

  const selectedAddressData = addresses.find((a) => a.id === selectedAddress)
  const selectedShippingData = shippingMethods.find(
    (m) => m.id === selectedShipping,
  )
  const selectedPaymentData = paymentMethods.find(
    (p) => p.id === selectedPayment,
  )

  const stepsOrder: CheckoutStep[] = [
    'address',
    'shipping',
    'payment',
    'review',
  ]

  const progressValue = ((stepsOrder.indexOf(activeSection) + 1) / 4) * 100

  const goToNextIncompleteStep = () => {
    if (!selectedAddress) {
      setActiveSection('address')
    } else if (!selectedShipping) {
      setActiveSection('shipping')
    } else if (!selectedPayment) {
      setActiveSection('payment')
    } else {
      setActiveSection('review')
    }
  }

  return (
    <StoreLayoutLite>
      <SectionContainer>
        <div className="grid w-full items-start gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:sticky lg:top-40 lg:col-span-7">
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

          <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
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
              isCompleted={!!selectedAddressData}
              onEdit={() => setActiveSection('address')}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-muted-foreground text-sm">
                    เลือกที่อยู่ที่ต้องการให้จัดส่ง
                  </span>
                  <CustomerAddressForm />
                </div>

                <div className="grid gap-2">
                  {addresses.map((addr) => (
                    <RadioCard
                      key={addr.id}
                      title={addr.title}
                      description={addr.description}
                      isSelected={selectedAddress === addr.id}
                      onSelect={() => setSelectedAddress(addr.id)}
                    />
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedAddressData}
                  onClick={goToNextIncompleteStep}
                >
                  ดำเนินการต่อ
                </Button>
              </div>

              {selectedAddressData && (
                <RadioCard
                  title={selectedAddressData.title}
                  description={selectedAddressData.description}
                  isSelected={true}
                  onSelect={() => {}}
                />
              )}
            </CheckoutSection>

            <CheckoutSection
              title="2. เลือกช่องทางจัดส่ง"
              isActive={activeSection === 'shipping'}
              isCompleted={!!selectedShipping}
              onEdit={() => setActiveSection('shipping')}
            >
              <div className="space-y-4">
                <div className="grid gap-2">
                  {shippingMethods.map((method) => (
                    <RadioCard
                      key={method.id}
                      title={method.title}
                      description={method.description}
                      price={method.price}
                      isSelected={selectedShipping === method.id}
                      onSelect={() => setSelectedShipping(method.id)}
                    />
                  ))}
                </div>
                <Button
                  className="w-full"
                  disabled={!selectedShippingData}
                  onClick={goToNextIncompleteStep}
                >
                  ดำเนินการต่อ
                </Button>
              </div>

              {selectedShippingData && (
                <RadioCard
                  title={selectedShippingData.title}
                  description={selectedShippingData.description}
                  price={selectedShippingData.price}
                  isSelected={true}
                  onSelect={() => {}}
                />
              )}
            </CheckoutSection>

            <CheckoutSection
              title="3. วิธีชำระเงิน"
              isActive={activeSection === 'payment'}
              isCompleted={!!selectedPayment}
              onEdit={() => setActiveSection('payment')}
            >
              <div className="space-y-3">
                <div className="grid gap-2">
                  {paymentMethods.map((method) => (
                    <RadioCard
                      key={method.id}
                      title={method.title}
                      description={method.description}
                      isSelected={selectedPayment === method.id}
                      onSelect={() => setSelectedPayment(method.id)}
                    />
                  ))}
                </div>
                <Button
                  className="mt-2 h-11 w-full"
                  disabled={!selectedPayment}
                  onClick={goToNextIncompleteStep}
                >
                  ดำเนินการต่อ
                </Button>
              </div>

              {selectedPaymentData && (
                <RadioCard
                  title={selectedPaymentData.title}
                  description={selectedPaymentData.description}
                  isSelected={true}
                  onSelect={() => {}}
                />
              )}
            </CheckoutSection>

            <div className="shadow-airy rounded-xl border border-gray-100 bg-white p-5">
              <SummaryRow label="ส่วนลด" value={<DiscountForm />} />
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
