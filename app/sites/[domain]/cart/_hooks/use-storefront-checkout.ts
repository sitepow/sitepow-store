'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'
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
  CountryCode,
  CurrencyCode,
  PaymentMethod,
  ProductType,
  UserRole,
} from '@/generated/prisma/enums'
import { getStoredAffiliateCode } from '@/hooks/use-affiliate-tracking'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { calculateGrandTotal } from '@/utils/cart'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'

import { useCartStore } from '../store'

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export function useStorefrontCheckout() {
  const t = useTranslations('storefront.cart')
  const { store } = useStoreData()
  const baseCurrency = (store as { baseCurrency?: CurrencyCode } | null)
    ?.baseCurrency
  const { currentCurrency, convert } = useStorefrontCurrency(baseCurrency)
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const storeSlug = params.domain as string
  const { isAuthenticated, user } = useSession()

  const isEmailUnverified = Boolean(isAuthenticated && !user?.emailVerified)
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

  const { data: addressOptions = [] } = useAddressOptions(store?.slug ?? '')
  const selectedAddressData = addressOptions.find(
    (a) => a.id === selectedAddress,
  )
  const destinationCountry =
    (selectedAddressData as { country?: CountryCode } | undefined)?.country ??
    CountryCode.TH

  const { data: shippingOptions = [] } = useStorefrontShippingOptions(
    storeSlug,
    destinationCountry,
  )
  const { data: paymentOptions } = useStorefrontPaymentOptions(storeSlug)

  const createOrderMutation = useCreateOrder()
  const storeCheckoutMutation = useStoreCheckout()

  const isDomesticThaiOrder =
    destinationCountry === CountryCode.TH &&
    currentCurrency === CurrencyCode.THB

  const paymentMethods = useMemo(() => {
    if (!isDomesticThaiOrder) {
      if (!paymentOptions?.isStripeEnabled) return []
      return [
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
    }

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
  }, [paymentOptions, isDomesticThaiOrder, t])

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
    destinationCountry,
    destinationProvince,
    destinationPostcode,
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

  const stepsOrder = useMemo<CheckoutStep[]>(() => {
    const steps: CheckoutStep[] = []
    if (hasPhysical) steps.push('address', 'shipping')
    steps.push('payment', 'review')
    return steps
  }, [hasPhysical])

  const activeSection = useMemo<CheckoutStep>(() => {
    if (userSelectedSection) return userSelectedSection
    return hasPhysical ? 'address' : 'payment'
  }, [hasPhysical, userSelectedSection])

  const progressValue =
    ((stepsOrder.indexOf(activeSection) + 1) / stepsOrder.length) * 100

  const getStepNumber = (step: CheckoutStep) => stepsOrder.indexOf(step) + 1

  const getNextStep = useCallback(
    (addr: string, ship: string, pay: string): CheckoutStep => {
      if (hasPhysical && !addr) return 'address'
      if (hasPhysical && !ship) return 'shipping'
      if (!pay) return 'payment'
      return 'review'
    },
    [hasPhysical],
  )

  const handleNextIncompleteStep = useCallback(() => {
    const currentIndex = stepsOrder.indexOf(activeSection)
    const nextStep = stepsOrder[currentIndex + 1]
    setUserSelectedSection(nextStep ?? 'review')
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
    if (paymentMethods.length === 0) {
      if (selectedPayment) setSelectedPayment('')
      return
    }

    const isCurrentValid = paymentMethods.some((p) => p.id === selectedPayment)
    if (!isCurrentValid) {
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
    if (hasPhysical && (!selectedAddressData || !selectedShippingData)) return
    if (!selectedPaymentData) return

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
        shippingFee,
        paymentMethod: paymentMethodEnum,
        bankAccountId: selectedBankAcc?.id,
        couponId: appliedCoupon?.id,
        usedPoints,
        earnedPoints: summary.totalPoints,
        affiliateCode,
        customerCurrency: currentCurrency,
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
          if (!res.success || !res.allOrders) return

          const orderIdsString = res.allOrders.map((o) => o.id).join(',')
          const orderNumbersString = res.allOrders
            .map((o) => o.orderNumber)
            .join(', ')
          const calculatedGrandTotal = res.allOrders.reduce(
            (sum, order) => sum + Number(order.totalAmount),
            0,
          )

          clearCart()

          if (isStripePayment && store?.id) {
            storeCheckoutMutation.mutate({
              customerEmail: user?.email ?? '',
              storeId: store.id,
              orderIds: orderIdsString,
              description: t('orderPaymentFor', { orders: orderNumbersString }),
              amount: calculatedGrandTotal,
              currency: currentCurrency,
              successUrl: `${window.location.origin}/user/orders`,
              cancelUrl: `${window.location.origin}/user/orders`,
            })
          } else {
            router.push('/user/orders')
          }
        },
      },
    )
  }

  return {
    store,
    items,
    summary,
    physicalItems,
    physicalGroups,
    hasPhysical,
    selectedAddress,
    setSelectedAddress,
    addressOptions,
    selectedAddressData,
    selectedShipping,
    setSelectedShipping,
    shippingOptionsWithFees,
    selectedShippingData,
    selectedPayment,
    setSelectedPayment,
    paymentMethods,
    selectedPaymentData,
    stepsOrder,
    activeSection,
    setUserSelectedSection,
    progressValue,
    getStepNumber,
    handleNextIncompleteStep,
    shippingFee,
    grandTotal,
    pointsDiscount,
    couponDiscount,
    appliedCoupon,
    currentCurrency,
    convert,
    isAuthenticated,
    isEmailUnverified,
    loginHref,
    handleCreateOrder,
    isSubmitting:
      createOrderMutation.isPending || storeCheckoutMutation.isPending,
    removeItem,
    updateQuantity,
    sectionDescription,
    isDomesticThaiOrder,
  }
}
