'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useAddressOptions } from '@/actions/hooks/storefront/address'
import { useStorefrontPaymentOptions } from '@/actions/hooks/storefront/payment'
import { useStorefrontShippingOptions } from '@/actions/hooks/storefront/shipping'
import { getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import {
  IconAlertCircle,
  IconCreditCard,
  IconMapPin,
  IconShoppingCartCheck,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { ChevronLeftIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'

import { CircularProgress } from '../_components/CircularProgress'
import { CartItemCard } from '../_components/cart/_components/CartItemCard'
import { CartSummary } from '../_components/cart/_components/CartSummary'
import { SummaryRow } from '../_components/cart/_components/SummaryRow'
import { StoreLayoutCheckout } from '../_components/layout/checkout/Layout'
import { CheckoutSection } from './_components/CheckoutSection'
import { CustomerAddressCreateDialog } from './_components/CustomerAddressCreateDialog'
import { DiscountForm } from './_components/DiscountForm'
import { RadioCard } from './_components/RadioCard'
import { useCartStore } from './store'

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export default function StoreCartPage() {
  const params = useParams()
  const storeSlug = params.domain as string

  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [activeSection, setActiveSection] = useState<CheckoutStep>('address')

  const { data: addressOptions = [] } = useAddressOptions()
  const { data: shippingOptions = [] } = useStorefrontShippingOptions(storeSlug)
  const { data: paymentOptions } = useStorefrontPaymentOptions(storeSlug)

  const stepIcons = {
    address: IconMapPin,
    shipping: IconTruckDelivery,
    payment: IconCreditCard,
    review: IconShoppingCartCheck,
  }

  const paymentMethods = [
    ...(paymentOptions?.isBankTransferEnabled
      ? paymentOptions.bankAccounts.map((acc) => ({
          id: acc.id,
          title: `โอนเงิน - ${acc.bankName}`,
          description: `${acc.accountNumber} · ${acc.accountName}`,
        }))
      : []),
    ...(paymentOptions?.isStripeEnabled
      ? [
          {
            id: 'promptpay',
            title: 'QR พร้อมเพย์',
            description: 'รองรับแอปธนาคารทุกแห่ง',
          },
          {
            id: 'stripe',
            title: 'บัตรเครดิต / เดบิต',
            description: 'ชำระผ่าน Visa หรือ Mastercard',
          },
        ]
      : []),
  ]

  const selectedAddressData = addressOptions.find(
    (a) => a.id === selectedAddress,
  )
  const selectedShippingData = shippingOptions.find(
    (s) => s.id === selectedShipping,
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
    <StoreLayoutCheckout>
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
              <div className="rounded-xl bg-gray-50/50 px-5 py-2.5 text-start font-bold">
                <h2>ตะกร้าสินค้า</h2>
              </div>

              <div className="space-y-8 p-5 text-start">
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
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
            <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-2.5 text-start">
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
                  <CustomerAddressCreateDialog />
                </div>

                {addressOptions?.length === 0 && (
                  <Alert>
                    <AlertDescription className="flex flex-wrap items-center gap-2">
                      <IconAlertCircle />
                      ไม่มีที่อยู่สำหรับการจัดส่งสินค้า
                    </AlertDescription>
                  </Alert>
                )}

                {addressOptions?.length !== 0 && (
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                  >
                    <div className="grid gap-2">
                      {addressOptions.map((addr) => (
                        <RadioCard
                          key={addr.id}
                          id={`addr-${addr.id}`}
                          value={addr.id}
                          title={`${addr.receiverName} (${addr.name})`}
                          description={`${addr.addressLine} ${addr.subDistrict} ${addr.district} ${addr.province}`}
                        />
                      ))}
                    </div>
                  </RadioGroup>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedAddressData}
                  onClick={goToNextIncompleteStep}
                >
                  ดำเนินการต่อ
                </Button>
              </div>

              {selectedAddressData && (
                <RadioGroup value={selectedAddress}>
                  <RadioCard
                    id={`summary-addr-${selectedAddressData.id}`}
                    value={selectedAddressData.id}
                    title={`${selectedAddressData.receiverName} (${selectedAddressData.name})`}
                    description={`${selectedAddressData.addressLine} ${selectedAddressData.subDistrict} ${selectedAddressData.district} ${selectedAddressData.province}`}
                  />
                </RadioGroup>
              )}
            </CheckoutSection>

            <CheckoutSection
              title="2. เลือกช่องทางจัดส่ง"
              isActive={activeSection === 'shipping'}
              isCompleted={!!selectedShipping}
              onEdit={() => setActiveSection('shipping')}
            >
              <div className="space-y-4">
                {shippingOptions.length === 0 && (
                  <Alert>
                    <AlertDescription className="flex flex-wrap items-center gap-2">
                      <IconAlertCircle />
                      ร้านค้านี้ยังไม่ได้ตั้งค่าช่องทางจัดส่ง
                      กรุณาติดต่อร้านค้าโดยตรง
                    </AlertDescription>
                  </Alert>
                )}

                {shippingOptions.length !== 0 && (
                  <RadioGroup
                    value={selectedShipping}
                    onValueChange={setSelectedShipping}
                  >
                    <div className="grid gap-2">
                      {shippingOptions.map((method) => (
                        <RadioCard
                          key={method.id}
                          id={`ship-${method.id}`}
                          value={method.id}
                          title={method.courierService.name}
                          description={
                            method.courierService.estimatedDays
                              ? `จัดส่งภายใน ${method.courierService.estimatedDays}`
                              : method.courierService.courier.name
                          }
                        />
                      ))}
                    </div>
                  </RadioGroup>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedShippingData}
                  onClick={goToNextIncompleteStep}
                >
                  ดำเนินการต่อ
                </Button>
              </div>

              {selectedShippingData && (
                <RadioGroup value={selectedShipping}>
                  <RadioCard
                    id={`summary-ship-${selectedShippingData.id}`}
                    value={selectedShippingData.id}
                    title={selectedShippingData.courierService.name}
                    description={
                      selectedShippingData.courierService.estimatedDays
                        ? `จัดส่งภายใน ${selectedShippingData.courierService.estimatedDays}`
                        : selectedShippingData.courierService.courier.name
                    }
                  />
                </RadioGroup>
              )}
            </CheckoutSection>

            <CheckoutSection
              title="3. วิธีชำระเงิน"
              isActive={activeSection === 'payment'}
              isCompleted={!!selectedPayment}
              onEdit={() => setActiveSection('payment')}
            >
              <div className="space-y-3">
                {paymentMethods.length === 0 && (
                  <Alert>
                    <AlertDescription className="flex flex-wrap items-center gap-2">
                      <IconAlertCircle />
                      ร้านค้านี้ยังไม่ได้ตั้งค่าช่องทางชำระเงิน
                      กรุณาติดต่อร้านค้าโดยตรง
                    </AlertDescription>
                  </Alert>
                )}

                {paymentMethods.length !== 0 && (
                  <RadioGroup
                    value={selectedPayment}
                    onValueChange={setSelectedPayment}
                  >
                    <div className="grid gap-2">
                      {paymentMethods.map((method) => (
                        <RadioCard
                          key={method.id}
                          id={`pay-${method.id}`}
                          value={method.id}
                          title={method.title}
                          description={method.description}
                        />
                      ))}
                    </div>
                  </RadioGroup>
                )}

                <Button
                  className="mt-2 h-11 w-full"
                  disabled={!selectedPayment || paymentMethods.length === 0}
                  onClick={goToNextIncompleteStep}
                >
                  ดำเนินการต่อ
                </Button>
              </div>

              {selectedPaymentData && (
                <RadioGroup value={selectedPayment}>
                  <RadioCard
                    id={`summary-pay-${selectedPaymentData.id}`}
                    value={selectedPaymentData.id}
                    title={selectedPaymentData.title}
                    description={selectedPaymentData.description}
                  />
                </RadioGroup>
              )}
            </CheckoutSection>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
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
    </StoreLayoutCheckout>
  )
}
