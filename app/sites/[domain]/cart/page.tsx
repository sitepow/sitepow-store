/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'

import { useStoreCheckout } from '@/actions/hooks/checkout'
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
import { getStoredAffiliateCode } from '@/hooks/use-affiliate-tracking'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { calculateGrandTotal, getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import {
  IconAlertCircle,
  IconArrowRight,
  IconCreditCard,
  IconLock,
  IconMapPin,
  IconShoppingCartCheck,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { ChevronLeftIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { HighlightText } from '@/components/HighlightText'
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
  const t = useTranslations('storefront.cart')
  const { store } = useStoreData()
  const isMounted = useIsMounted()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const storeSlug = params.domain as string
  const { isAuthenticated, user } = useSession()

  const isEmailUnverified = isAuthenticated && !user?.emailVerified

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const loginParams = new URLSearchParams()
  loginParams.set('role', UserRole.CUSTOMER)
  if (currentUrl && currentUrl !== '/') {
    loginParams.set('callbackUrl', currentUrl)
  }

  const loginHref = `/login?${loginParams.toString()}`

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

  const physicalItems = useMemo(
    () => items.filter((item) => item.productType === ProductType.PHYSICAL),
    [items],
  )
  const hasPhysical = physicalItems.length > 0

  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [userSelectedSection, setUserSelectedSection] =
    useState<CheckoutStep | null>(null)

  const { data: addressOptions = [] } = useAddressOptions(store?.slug!)
  const { data: shippingOptions = [] } = useStorefrontShippingOptions(storeSlug)
  const { data: paymentOptions } = useStorefrontPaymentOptions(storeSlug)

  const createOrderMutation = useCreateOrder()
  const storeCheckoutMutation = useStoreCheckout()

  const stepIcons = {
    address: IconMapPin,
    shipping: IconTruckDelivery,
    payment: IconCreditCard,
    review: IconShoppingCartCheck,
  }

  const paymentMethods = useMemo(() => {
    return [
      ...(paymentOptions?.isBankTransferEnabled
        ? paymentOptions.bankAccounts.map((acc) => {
            const baseDescription =
              acc.type === BankAccountType.PROMPTPAY
                ? `${formatPromptPay(acc.promptPayId)} (${acc.accountName})`
                : t('bankAccountDesc', {
                    bank: acc.bankName,
                    number: formatBankAccount(acc.accountNumber),
                    name: acc.accountName,
                  })

            return {
              id: acc.id,
              title:
                acc.type === BankAccountType.PROMPTPAY
                  ? t('promptpay')
                  : t('bankTransfer'),
              description: `${baseDescription} (${t('manualUploadSlip')})`,
            }
          })
        : []),
      ...(paymentOptions?.isStripeEnabled
        ? [
            {
              id: PaymentMethod.STRIPE_QR_PROMPTPAY,
              title: t('stripePromptpay'),
              description: t('stripePromptpayDesc'),
            },
            {
              id: PaymentMethod.STRIPE_CREDIT_CARD,
              title: t('stripeCard'),
              description: t('stripeCardDesc'),
            },
            {
              id: PaymentMethod.STRIPE_GOOGLE_PAY,
              title: '(Stripe) Google Pay',
              description: t('googlePayDesc'),
            },
            {
              id: PaymentMethod.STRIPE_APPLE_PAY,
              title: '(Stripe) Apple Pay',
              description: t('applePayDesc'),
            },
          ]
        : []),
    ]
  }, [paymentOptions, t])

  const selectedAddressData = addressOptions.find(
    (a) => a.id === selectedAddress,
  )

  const selectedPaymentData = paymentMethods.find(
    (p) => p.id === selectedPayment,
  )

  const destinationProvince = selectedAddressData?.province ?? ''
  const destinationPostcode = selectedAddressData?.postalCode ?? ''

  const physicalGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        branchId: string
        branchName?: string
        province: string
        totalWeight: number
        items: typeof physicalItems
      }
    > = {}

    for (const item of physicalItems) {
      const branchId = item.branchId
      const branchProvince = item.branchName

      if (!groups[branchId]) {
        groups[branchId] = {
          branchId,
          branchName: item.branchName,
          province: branchProvince,
          totalWeight: 0,
          items: [],
        }
      }
      groups[branchId].totalWeight += (item.weight || 0) * item.quantity
      groups[branchId].items.push(item)
    }

    return Object.values(groups)
  }, [physicalItems])

  const { data: shippingCalculationData } = useShippingCalculation({
    storeId: store?.id ?? '',
    destinationProvince: destinationProvince,
    destinationPostcode: destinationPostcode,
    groups: physicalGroups.map((g) => ({
      branchId: g.branchId,
      province: g.province,
      weight: g.totalWeight,
    })),
  })

  const shippingOptionsWithFees = useMemo(() => {
    return shippingOptions.map((option) => {
      const feeData = shippingCalculationData?.find(
        (f) => f.serviceId === option.id,
      )
      return {
        ...option,
        fee: feeData ? feeData.fee : null,
      }
    })
  }, [shippingOptions, shippingCalculationData])

  const selectedShippingData = shippingOptionsWithFees.find(
    (s) => s.id === selectedShipping,
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
  }

  const getStepNumber = (step: CheckoutStep) => {
    return stepsOrder.indexOf(step) + 1
  }

  const getNextStep = useCallback(
    (
      currentAddr: string,
      currentShip: string,
      currentPay: string,
    ): CheckoutStep => {
      if (hasPhysical && !currentAddr) return 'address'
      if (hasPhysical && !currentShip) return 'shipping'
      if (!currentPay) return 'payment'
      return 'review'
    },
    [hasPhysical],
  )

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
    if (paymentId === PaymentMethod.STRIPE_QR_PROMPTPAY)
      return PaymentMethod.STRIPE_QR_PROMPTPAY
    if (paymentId === PaymentMethod.STRIPE_CREDIT_CARD)
      return PaymentMethod.STRIPE_CREDIT_CARD
    if (paymentId === PaymentMethod.STRIPE_GOOGLE_PAY)
      return PaymentMethod.STRIPE_GOOGLE_PAY
    if (paymentId === PaymentMethod.STRIPE_APPLE_PAY)
      return PaymentMethod.STRIPE_APPLE_PAY

    const selectedAcc = paymentOptions?.bankAccounts.find(
      (a) => a.id === paymentId,
    )
    if (selectedAcc?.type === BankAccountType.PROMPTPAY) {
      return PaymentMethod.MANUAL_QR_PROMPTPAY
    }
    return PaymentMethod.BANK_TRANSFER
  }

  const sectionDescription = useMemo(() => {
    switch (activeSection) {
      case 'address':
        return t('stepAddressAction')
      case 'shipping':
        return t('stepShippingAction')
      case 'payment':
        return t('stepPaymentAction')
      case 'review':
        return t('stepReviewAction')
      default:
        return t('proceedOrder')
    }
  }, [activeSection, t])

  useEffect(() => {
    if (hasPhysical && !selectedAddress && addressOptions.length > 0) {
      const defaultAddr =
        addressOptions.find((a) => a.isDefault) || addressOptions[0]
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id)
        setUserSelectedSection(
          (prev) =>
            prev ??
            getNextStep(defaultAddr.id, selectedShipping, selectedPayment),
        )
      }
    }
  }, [
    hasPhysical,
    selectedAddress,
    addressOptions,
    selectedShipping,
    selectedPayment,
    getNextStep,
  ])

  useEffect(() => {
    if (hasPhysical && selectedAddress && !selectedShipping) {
      const validOptions = shippingOptionsWithFees.filter(
        (opt) => opt.fee !== null,
      )
      if (validOptions.length > 0) {
        const cheapest = validOptions.reduce((prev, curr) =>
          prev.fee! < curr.fee! ? prev : curr,
        )
        setSelectedShipping(cheapest.id)
        setUserSelectedSection((prev) =>
          prev === 'shipping' || prev === 'address' || !prev
            ? getNextStep(selectedAddress, cheapest.id, selectedPayment)
            : prev,
        )
      }
    }
  }, [
    hasPhysical,
    selectedAddress,
    selectedShipping,
    shippingOptionsWithFees,
    selectedPayment,
    getNextStep,
  ])

  useEffect(() => {
    if (!selectedPayment && paymentMethods.length > 0) {
      const firstPayment = paymentMethods[0].id
      setSelectedPayment(firstPayment)
      setUserSelectedSection((prev) =>
        prev === 'payment' || !prev
          ? getNextStep(selectedAddress, selectedShipping, firstPayment)
          : prev,
      )
    }
  }, [
    selectedPayment,
    paymentMethods,
    selectedAddress,
    selectedShipping,
    getNextStep,
  ])

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

    const paymentMethodEnum = getPaymentMethod(selectedPaymentData.id)
    const isStripePayment =
      paymentMethodEnum !== PaymentMethod.BANK_TRANSFER &&
      paymentMethodEnum !== PaymentMethod.CASH_ON_DELIVERY &&
      paymentMethodEnum !== PaymentMethod.MANUAL_QR_PROMPTPAY

    const affiliateCode = getStoredAffiliateCode(storeSlug) ?? undefined

    createOrderMutation.mutate(
      {
        storeSlug,
        addressId: selectedAddressData?.id ?? '',
        shippingMethod: selectedShippingData
          ? `${selectedShippingData.courierService.courier.name} (${selectedShippingData.courierService.name})`
          : '',
        storeCourierServiceId: selectedShippingData?.id ?? '',
        shippingFee: shippingFee,
        paymentMethod: paymentMethodEnum,
        bankAccountId: selectedBankAcc?.id,
        couponId: appliedCoupon?.id,
        usedPoints,
        earnedPoints: summary.totalPoints,
        affiliateCode,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variant.id,
          title: item.productTitle,
          variantTitle: item.variant.title,
          quantity: item.quantity,
          price: item.unitPrice,
          image: item.image ?? null,
          originalPrice: item.originalPrice ?? item.unitPrice,
          productType: item.productType,
          branchId: item.branchId,
        })),
      },
      {
        onSuccess: (res) => {
          if (res.success && res.allOrders) {
            const orderIdsString = res.allOrders
              .map((order) => order.id)
              .join(',')
            const orderNumbersString = res.allOrders
              .map((order) => order.orderNumber)
              .join(', ')

            const calculatedGrandTotal = res.allOrders.reduce(
              (sum: number, order) => sum + Number(order.totalAmount),
              0,
            )

            clearCart()

            if (isStripePayment && store?.id) {
              storeCheckoutMutation.mutate({
                customerEmail: user?.email ?? '',
                storeId: store.id,
                orderIds: orderIdsString,
                description: t('orderPaymentFor', {
                  orders: orderNumbersString,
                }),
                amount: calculatedGrandTotal,
                successUrl: `${window.location.origin}/user/orders`,
                cancelUrl: `${window.location.origin}/user/orders`,
              })
            } else {
              router.push('/user/orders')
            }
          }
        },
      },
    )
  }

  if (!isMounted) {
    return null
  }

  return (
    <StoreLayoutCheckout>
      <SectionContainer>
        <div className="text-foreground grid w-full items-start gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:sticky lg:top-40 lg:col-span-8">
            <div className="flex items-center justify-between">
              <Link href={'/'}>
                <Button variant="ghost" className="text-muted-foreground -ml-4">
                  <ChevronLeftIcon />
                  <span>{t('editItems')}</span>
                </Button>
              </Link>
            </div>
            <div className="border-border flex flex-col rounded-xl border">
              <div className="rounded-xl px-5 py-2.5 text-start font-bold">
                <h2>
                  {t('cartItems')}{' '}
                  {physicalGroups.length > 0 && (
                    <span className="text-primary text-xs font-normal">
                      ({t('shippingFromBranch')}{' '}
                      {physicalGroups
                        .map((g) => g.branchName)
                        .filter(Boolean)
                        .join(', ')}
                      )
                    </span>
                  )}
                </h2>
              </div>
              {items?.length === 0 && (
                <div className="p-5">
                  <Alert>
                    <AlertDescription className="flex items-center gap-2">
                      <IconAlertCircle /> {t('empty')}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              {items?.length !== 0 && (
                <div className="space-y-8 p-5 text-start">
                  {items.map((item) => {
                    const stock = item.variant.stocks
                      .filter((s) => s.branchId === item.branchId)
                      .reduce((sum, s) => sum + s.quantity, 0)

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
          <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-4">
            <div className="border-border relative overflow-hidden rounded-xl border px-5 py-2.5 text-start shadow-sm">
              <div className="relative z-10 flex items-center gap-5">
                <CircularProgress
                  size={60}
                  value={progressValue}
                  icon={stepIcons[activeSection]}
                />
                <div className="space-y-0.5">
                  <h3 className="font-bold" suppressHydrationWarning>
                    {t('totalToPay')}{' '}
                    <span className="font-extrabold">
                      {formatCurrency(grandTotal)}
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {sectionDescription}
                  </p>
                </div>
              </div>
            </div>
            {physicalItems?.length > 0 && (
              <CheckoutSection
                title={`${getStepNumber('address')}. ${t('stepAddressTitle')}`}
                isActive={activeSection === 'address'}
                isCompleted={!!selectedAddressData}
                onEdit={() => handleSectionChange('address')}
                isDisabled={!isAuthenticated}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <span className="text-muted-foreground text-sm">
                      {t('selectDeliveryAddress')}
                    </span>
                    <CustomerAddressCreateDialog />
                  </div>
                  {addressOptions?.length === 0 && (
                    <ActionRequiredAlert
                      title={t('errorTitle')}
                      description={t('noAddressError')}
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
                    variant="outline"
                    disabled={!selectedAddressData}
                    onClick={goToNextIncompleteStep}
                  >
                    {t('continue')} <IconArrowRight />
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
                title={`${getStepNumber('shipping')}. ${t('stepShippingTitle')}`}
                isActive={activeSection === 'shipping'}
                isCompleted={!!selectedShipping}
                onEdit={() => handleSectionChange('shipping')}
                isDisabled={!isAuthenticated}
              >
                <div className="space-y-4">
                  {shippingOptions.length === 0 && (
                    <ActionRequiredAlert
                      title={t('errorTitle')}
                      description={t('noShippingError')}
                    />
                  )}
                  {shippingOptionsWithFees.length !== 0 && (
                    <RadioGroup
                      value={selectedShipping}
                      onValueChange={setSelectedShipping}
                    >
                      <div className="grid gap-2">
                        {shippingOptionsWithFees.map((method) => {
                          const isSupported = method.fee !== null
                          return (
                            <RadioCard
                              key={method.id}
                              id={`ship-${method.id}`}
                              value={method.id}
                              title={`${method.courierService.courier.name} (${method.courierService.name})`}
                              description={
                                <>
                                  <span>
                                    {t('shippingFeePrefix')}{' '}
                                    {formatCurrency(method.fee ?? 0)}
                                  </span>{' '}
                                  <br />
                                  <span>
                                    {t('deliveryTime')}{' '}
                                    {method.courierService.estimatedDays
                                      ? t('deliveryDaysEstimated', {
                                          days: method.courierService
                                            .estimatedDays,
                                        })
                                      : method.courierService.courier.name}
                                  </span>
                                </>
                              }
                              disabled={!isSupported}
                            />
                          )
                        })}
                      </div>
                    </RadioGroup>
                  )}
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={!selectedShippingData}
                    onClick={goToNextIncompleteStep}
                  >
                    {t('continue')} <IconArrowRight />
                  </Button>
                </div>
                {selectedShippingData && (
                  <RadioGroup value={selectedShipping}>
                    <RadioCard
                      id={`summary-ship-${selectedShippingData.id}`}
                      value={selectedShippingData.id}
                      title={`${selectedShippingData.courierService.courier.name} (${selectedShippingData.courierService.name})`}
                      description={
                        <>
                          <span>
                            {t('shippingFeePrefix')}{' '}
                            {selectedShippingData.fee !== null
                              ? formatCurrency(selectedShippingData.fee)
                              : t('notSupportWeight')}
                          </span>{' '}
                          <br />
                          <span>
                            {t('deliveryTime')}{' '}
                            {selectedShippingData.courierService.estimatedDays
                              ? t('deliveryDaysEstimated', {
                                  days: selectedShippingData.courierService
                                    .estimatedDays,
                                })
                              : selectedShippingData.courierService.courier
                                  .name}
                          </span>
                        </>
                      }
                    />
                  </RadioGroup>
                )}
              </CheckoutSection>
            )}
            <CheckoutSection
              title={`${getStepNumber('payment')}. ${t('stepPaymentTitle')}`}
              isActive={activeSection === 'payment'}
              isCompleted={!!selectedPayment}
              onEdit={() => handleSectionChange('payment')}
              isDisabled={!isAuthenticated}
            >
              <div className="space-y-3">
                {paymentMethods.length === 0 && (
                  <ActionRequiredAlert
                    title={t('errorTitle')}
                    description={t('noPaymentError')}
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
                  variant="outline"
                  disabled={!selectedPayment || paymentMethods.length === 0}
                  onClick={goToNextIncompleteStep}
                >
                  {t('continue')} <IconArrowRight />
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
            <div
              style={
                { '--primary': store?.primaryColor } as React.CSSProperties
              }
              className="border-border relative overflow-hidden rounded-xl border p-5"
            >
              <div className="relative z-10">
                <SummaryRow
                  className="mb-5"
                  label={t('discount')}
                  value={<DiscountForm subtotal={summary.finalPrice} />}
                />
                <SummaryRow
                  label={t('totalShippingFee')}
                  value={formatCurrency(shippingFee)}
                />
                <div>
                  <CartSummary summary={summary} />
                </div>
                {(pointsDiscount > 0 || couponDiscount > 0) && (
                  <div className="border-border mt-2 space-y-1 border-t pt-2">
                    {pointsDiscount > 0 && (
                      <SummaryRow
                        label={t('pointsDiscountLabel')}
                        value={
                          <HighlightText>
                            - {formatCurrency(pointsDiscount)}
                          </HighlightText>
                        }
                      />
                    )}
                    {couponDiscount > 0 && (
                      <SummaryRow
                        label={t('couponDiscountCode', {
                          code: appliedCoupon?.code ?? '',
                        })}
                        value={
                          <HighlightText>
                            - {formatCurrency(couponDiscount)}
                          </HighlightText>
                        }
                      />
                    )}
                  </div>
                )}
                <div className="border-border mt-4 border-t pt-2">
                  <SummaryTotal
                    label={t('orderTotal')}
                    value={formatCurrency(grandTotal)}
                  />
                </div>
                {isAuthenticated && (
                  <Button
                    className="mt-6 h-12 w-full text-lg font-bold shadow-md transition-transform hover:scale-[1.01]"
                    size="lg"
                    disabled={
                      activeSection !== 'review' ||
                      createOrderMutation.isPending ||
                      storeCheckoutMutation.isPending ||
                      items?.length === 0 ||
                      isEmailUnverified
                    }
                    onClick={handleCreateOrder}
                  >
                    {createOrderMutation.isPending ||
                    storeCheckoutMutation.isPending
                      ? t('processingOrderBtn')
                      : t('placeOrderAction')}
                  </Button>
                )}
                {!isAuthenticated && (
                  <Button
                    className="mt-6 h-12 w-full text-lg font-bold shadow-md"
                    size="lg"
                    asChild
                  >
                    <Link href={loginHref}>
                      {t('loginToOrder')} <IconLock className="ml-1 size-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </StoreLayoutCheckout>
  )
}
