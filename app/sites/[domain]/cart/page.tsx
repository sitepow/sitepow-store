/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useAddressOptions } from '@/actions/hooks/storefront/address'
import { useStorefrontLoyalty } from '@/actions/hooks/storefront/discount'
import { useCreateOrder } from '@/actions/hooks/storefront/order'
import { useStorefrontPaymentOptions } from '@/actions/hooks/storefront/payment'
import {
  useShippingCalculation,
  useStorefrontShippingOptions,
} from '@/actions/hooks/storefront/shipping'
import {
  BankAccountType,
  PaymentMethod,
  ProductType,
  UserRole,
} from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { getClientAuthUrl } from '@/utils/auth'
import { calculateGrandTotal, getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import {
  IconAlertCircle,
  IconCreditCard,
  IconLock,
  IconMapPin,
  IconShoppingCartCheck,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { ChevronLeftIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { SectionContainer } from '@/components/SectionContainer'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'

import { CircularProgress } from '../_components/CircularProgress'
import { CartItemCard } from '../_components/cart/_components/CartItemCard'
import { CartSummary } from '../_components/cart/_components/CartSummary'
import { SummaryRow } from '../_components/cart/_components/SummaryRow'
import { SummaryTotal } from '../_components/cart/_components/SummaryTotal'
import { StoreLayoutCheckout } from '../_components/layout/checkout/Layout'
import { CheckoutSection } from './_components/CheckoutSection'
import { CustomerAddressCreateDialog } from './_components/CustomerAddressCreateDialog'
import { DiscountForm } from './_components/DiscountForm'
import { RadioCard } from './_components/RadioCard'
import { useCartStore } from './store'

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export default function StoreCartPage() {
  const { store } = useStoreData()
  const isMounted = useIsMounted()
  const router = useRouter()
  const params = useParams()
  const storeSlug = params.domain as string
  const { isAuthenticated } = useSession()
  const loginHref = isMounted
    ? getClientAuthUrl({ path: 'login', role: UserRole.CUSTOMER })
    : '#'

  const {
    items,
    updateQuantity,
    removeItem,
    getCartSummary,
    clearCart,
    appliedCoupon,
    usedPoints,
  } = useCartStore()
  const summary = getCartSummary()

  const { data: loyalty } = useStorefrontLoyalty(storeSlug)
  const pointsDiscount = usedPoints * (loyalty?.pointRedeemRate ?? 0)
  const couponDiscount = appliedCoupon?.discountAmount ?? 0

  const physicalItems = items.filter(
    (item) => item.productType === ProductType.PHYSICAL,
  )
  const hasPhysical = physicalItems.length > 0
  const physicalTotalWeight = physicalItems.reduce(
    (sum, item) => sum + (item.weight || 0) * item.quantity,
    0,
  )

  const { data: shippingFees } = useShippingCalculation({
    storeId: store?.id ?? '',
    originProvince: 'กรุงเทพมหานคร',
    destinationProvince: 'อุบลราชธานี',
    destinationPostcode: '34000',
    weight: physicalTotalWeight || 780,
  })

  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [userSelectedSection, setUserSelectedSection] =
    useState<CheckoutStep | null>(null)
  const [hasUserIntervened, setHasUserIntervened] = useState(false)

  const { data: addressOptions = [] } = useAddressOptions()
  const { data: shippingOptions = [] } = useStorefrontShippingOptions(storeSlug)
  const { data: paymentOptions } = useStorefrontPaymentOptions(storeSlug)

  const shippingOptionsWithFees = useMemo(() => {
    return shippingOptions.map((option) => {
      const feeData = shippingFees?.find((f) => f.serviceId === option.id)
      return {
        ...option,
        fee: feeData?.fee ?? null,
      }
    })
  }, [shippingOptions, shippingFees])

  const createOrderMutation = useCreateOrder()

  const stepIcons = {
    address: IconMapPin,
    shipping: IconTruckDelivery,
    payment: IconCreditCard,
    review: IconShoppingCartCheck,
  }

  const paymentMethods = useMemo(() => {
    return [
      ...(paymentOptions?.isBankTransferEnabled
        ? paymentOptions.bankAccounts.map((acc) => ({
            id: acc.id,
            title:
              acc.type === BankAccountType.PROMPTPAY
                ? 'พร้อมเพย์ (PromptPay)'
                : 'โอนเงินบัญชีธนาคาร',
            description:
              acc.type === BankAccountType.PROMPTPAY
                ? `${formatPromptPay(acc.promptPayId)} (${acc.accountName})`
                : `บัญชี ${acc.bankName} เลขที่ ${formatBankAccount(acc.accountNumber)} (${acc.accountName})`,
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
  }, [paymentOptions])

  const selectedAddressData = addressOptions.find(
    (a) => a.id === selectedAddress,
  )
  const selectedShippingData = shippingOptionsWithFees.find(
    (s) => s.id === selectedShipping,
  )
  const selectedPaymentData = paymentMethods.find(
    (p) => p.id === selectedPayment,
  )

  const stepsOrder = useMemo(() => {
    const steps: CheckoutStep[] = []
    if (hasPhysical) {
      steps.push('address', 'shipping')
    }
    steps.push('payment', 'review')
    return steps
  }, [hasPhysical])

  const activeSection = useMemo(() => {
    if (userSelectedSection) {
      return userSelectedSection
    }

    return hasPhysical ? 'address' : 'payment'
  }, [hasPhysical, userSelectedSection])

  const progressValue =
    ((stepsOrder.indexOf(activeSection) + 1) / stepsOrder.length) * 100

  const handleSectionChange = (section: CheckoutStep) => {
    setUserSelectedSection(section)
    setHasUserIntervened(true)
  }

  const getStepNumber = (step: CheckoutStep) => {
    return stepsOrder.indexOf(step) + 1
  }

  const goToNextIncompleteStep = useCallback(() => {
    const currentIndex = stepsOrder.indexOf(activeSection)
    const nextStep = stepsOrder[currentIndex + 1]

    if (nextStep) {
      setUserSelectedSection(nextStep)
    } else {
      setUserSelectedSection('review')
    }
  }, [stepsOrder, activeSection])

  const shippingFee = selectedShippingData?.fee ?? 0
  const grandTotal =
    calculateGrandTotal({
      subtotal: summary.finalPrice,
      pointsDiscount,
      couponDiscount,
    }) + shippingFee

  const getPaymentMethod = (paymentId: string): PaymentMethod => {
    if (paymentId === 'promptpay') {
      return PaymentMethod.QR_PROMPTPAY
    }
    if (paymentId === 'stripe') {
      return PaymentMethod.CREDIT_CARD
    }

    const selectedAcc = paymentOptions?.bankAccounts.find(
      (a) => a.id === paymentId,
    )

    if (selectedAcc?.type === BankAccountType.PROMPTPAY) {
      return PaymentMethod.QR_PROMPTPAY
    }

    return PaymentMethod.TRANSFER
  }

  const sectionDescription = useMemo(() => {
    switch (activeSection) {
      case 'address':
        return 'เลือกที่อยู่การจัดส่ง'
      case 'shipping':
        return 'เลือกช่องทางจัดส่งสินค้า'
      case 'payment':
        return 'เลือกวิธีชำระเงิน'
      case 'review':
        return 'ตรวจสอบรายการและยืนยันการสั่งซื้อ'
      default:
        return 'ดำเนินการสั่งซื้อ'
    }
  }, [activeSection])

  const handleCreateOrder = () => {
    if (hasPhysical && (!selectedAddressData || !selectedShippingData)) {
      return
    }

    if (!selectedPaymentData) {
      return
    }

    const selectedBankAcc = paymentOptions?.bankAccounts.find(
      (acc) => acc.id === selectedPayment,
    )

    createOrderMutation.mutate(
      {
        storeSlug,
        addressId: selectedAddressData?.id ?? '',
        shippingMethod: selectedShippingData?.courierService.name ?? '',
        storeCourierServiceId: selectedShippingData?.id ?? '',
        shippingFee: shippingFee,
        paymentMethod: getPaymentMethod(selectedPaymentData.id),
        bankAccountId: selectedBankAcc?.id,
        couponId: appliedCoupon?.id,
        usedPoints,
        earnedPoints: summary.totalPoints,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variant.id,
          title: item.productTitle,
          variantTitle: item.variant.title,
          quantity: item.quantity,
          price: item.unitPrice,
          productType: item.productType,
        })),
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            clearCart()
            router.push('/user/orders')
          }
        },
      },
    )
  }

  const cheapestShippingId = useMemo(() => {
    if (!hasPhysical) {
      return ''
    }

    const availableOptions = shippingOptionsWithFees.filter(
      (opt) => opt.fee !== null,
    )

    if (availableOptions.length === 0) {
      return ''
    }

    return availableOptions.reduce((prev, curr) =>
      prev.fee! < curr.fee! ? prev : curr,
    ).id
  }, [hasPhysical, shippingOptionsWithFees])

  useEffect(() => {
    if (hasUserIntervened) {
      return
    }

    if (
      !hasPhysical &&
      activeSection !== 'payment' &&
      activeSection !== 'review'
    ) {
      setUserSelectedSection('payment')
      return
    }

    if (hasPhysical) {
      const defaultAddress = addressOptions.find((addr) => addr.isDefault)
      if (defaultAddress && !selectedAddress) {
        setSelectedAddress(defaultAddress.id)
        setUserSelectedSection('shipping')
        return
      }

      if (
        cheapestShippingId &&
        !selectedShipping &&
        activeSection === 'shipping'
      ) {
        setSelectedShipping(cheapestShippingId)
        setUserSelectedSection('payment')
        return
      }
    }

    if (paymentMethods.length === 1 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0].id)
      return
    }

    const isPhysicalReady = hasPhysical
      ? selectedAddress && selectedShipping
      : true
    if (isPhysicalReady && selectedPayment && activeSection !== 'review') {
      setUserSelectedSection('review')
    }
  }, [
    hasPhysical,
    activeSection,
    addressOptions,
    selectedAddress,
    cheapestShippingId,
    selectedShipping,
    paymentMethods,
    selectedPayment,
    hasUserIntervened,
  ])

  if (!isMounted) {
    return null
  }

  return (
    <StoreLayoutCheckout>
      <SectionContainer>
        <div className="text-foreground grid w-full items-start gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:sticky lg:top-40 lg:col-span-7">
            <div className="flex items-center justify-between">
              <Link href={'/'}>
                <Button variant="ghost" className="text-muted-foreground -ml-4">
                  <ChevronLeftIcon />
                  <span>แก้ไขรายการสินค้า</span>
                </Button>
              </Link>
            </div>
            <div className="border-border flex flex-col rounded-xl border">
              <div className="bg-foreground/5 rounded-xl px-5 py-2.5 text-start font-bold">
                <h2>ตะกร้าสินค้า</h2>
              </div>
              {items?.length === 0 && (
                <div className="p-5">
                  <Alert>
                    <AlertDescription className="flex items-center gap-2">
                      <IconAlertCircle /> ยังไม่มีสินค้าในตระกร้า
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              {items?.length !== 0 && (
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
                        productClassName="sm:w-1/2"
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
            </div>
          </div>
          <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
            <div className="dark:bg-muted border-primary flex items-center gap-5 rounded-xl border px-5 py-2.5 text-start">
              <CircularProgress
                size={60}
                value={progressValue}
                icon={stepIcons[activeSection]}
              />
              <div className="space-y-0.5">
                <h3 className="font-bold" suppressHydrationWarning>
                  ยอดที่ต้องชำระ{' '}
                  <span className="text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </h3>
                <p className="text-xs opacity-50">{sectionDescription}</p>
              </div>
            </div>
            {physicalItems?.length > 0 && (
              <CheckoutSection
                title={`${getStepNumber('address')}. ที่อยู่สำหรับการจัดส่ง`}
                isActive={activeSection === 'address'}
                isCompleted={!!selectedAddressData}
                onEdit={() => handleSectionChange('address')}
                isDisabled={!isAuthenticated}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <span className="text-muted-foreground text-sm">
                      เลือกที่อยู่ที่ต้องการให้จัดส่ง
                    </span>
                    <CustomerAddressCreateDialog />
                  </div>
                  {addressOptions?.length === 0 && (
                    <ActionRequiredAlert
                      title="พบข้อผิดพลาด"
                      description="ไม่มีที่อยู่สำหรับการจัดส่งสินค้า"
                    />
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
            )}
            {physicalItems?.length > 0 && (
              <CheckoutSection
                title={`${getStepNumber('shipping')}. เลือกช่องทางจัดส่ง`}
                isActive={activeSection === 'shipping'}
                isCompleted={!!selectedShipping}
                onEdit={() => handleSectionChange('shipping')}
                isDisabled={!isAuthenticated}
              >
                <div className="space-y-4">
                  {shippingOptions.length === 0 && (
                    <ActionRequiredAlert
                      title="พบข้อผิดพลาด"
                      description="ร้านค้านี้ยังไม่ได้ตั้งค่าช่องทางจัดส่ง กรุณาติดต่อร้านค้าโดยตรง"
                    />
                  )}
                  {shippingOptionsWithFees.length !== 0 && (
                    <RadioGroup
                      value={selectedShipping}
                      onValueChange={setSelectedShipping}
                    >
                      <div className="grid gap-2">
                        {shippingOptionsWithFees.map((method) => (
                          <RadioCard
                            key={method.id}
                            id={`ship-${method.id}`}
                            value={method.id}
                            title={`${method.courierService.name} (${method.fee ? formatCurrency(method.fee) : 'ไม่รองรับน้ำหนักนี้'})`}
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
                      title={`${selectedShippingData.courierService.name} ${
                        selectedShippingData.fee !== null
                          ? `(${formatCurrency(selectedShippingData.fee)})`
                          : 'ไม่รองรับน้ำหนักนี้'
                      }`}
                      description={
                        selectedShippingData.courierService.estimatedDays
                          ? `จัดส่งภายใน ${selectedShippingData.courierService.estimatedDays}`
                          : selectedShippingData.courierService.courier.name
                      }
                    />
                  </RadioGroup>
                )}
              </CheckoutSection>
            )}
            <CheckoutSection
              title={`${getStepNumber('payment')}. วิธีชำระเงิน`}
              isActive={activeSection === 'payment'}
              isCompleted={!!selectedPayment}
              onEdit={() => handleSectionChange('payment')}
              isDisabled={!isAuthenticated}
            >
              <div className="space-y-3">
                {paymentMethods.length === 0 && (
                  <ActionRequiredAlert
                    title="พบข้อผิดพลาด"
                    description="ร้านค้านี้ยังไม่ได้ตั้งค่าช่องทางชำระเงิน กรุณาติดต่อร้านค้าโดยตรง"
                  />
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
            <div className="bg-foreground/5 border-border rounded-xl border p-5">
              <SummaryRow
                label="ส่วนลด"
                value={<DiscountForm subtotal={summary.finalPrice} />}
              />
              <SummaryRow
                label="ค่าจัดส่ง"
                value={formatCurrency(shippingFee)}
              />
              <CartSummary summary={summary} />
              {(pointsDiscount > 0 || couponDiscount > 0) && (
                <div className="mt-2 space-y-1 border-t pt-2">
                  {pointsDiscount > 0 && (
                    <SummaryRow
                      label="ส่วนลดจากแต้มสะสม"
                      value={`-${formatCurrency(pointsDiscount)}`}
                    />
                  )}
                  {couponDiscount > 0 && (
                    <SummaryRow
                      label={`ส่วนลดจากรหัส (${appliedCoupon?.code})`}
                      value={`-${formatCurrency(couponDiscount)}`}
                    />
                  )}
                </div>
              )}
              <SummaryTotal
                label="ยอดที่ต้องชำระ"
                value={formatCurrency(grandTotal)}
              />
              {isAuthenticated && (
                <Button
                  className="mt-6 h-12 w-full text-lg"
                  size="lg"

                  disabled={
                    activeSection !== 'review' ||
                    createOrderMutation.isPending ||
                    items?.length === 0
                  }
                  onClick={handleCreateOrder}
                >
                  {createOrderMutation.isPending
                    ? 'กำลังสั่งซื้อ...'
                    : 'สั่งสินค้า'}
                </Button>
              )}
              {!isAuthenticated && (
                <Button
                  className="mt-6 h-12 w-full text-lg"

                  onClick={() => {
                    router.push(loginHref)
                  }}
                >
                  <IconLock />
                  เข้าสู่ระบบเพื่อสั่งสินค้า
                </Button>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>
    </StoreLayoutCheckout>
  )
}
