'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useStoreCheckout } from '@/actions/hooks/checkout'
import { usePaymentSettingStatus } from '@/actions/hooks/payment'
import { useCreatePOSOrder } from '@/actions/hooks/pos/order'
import { useCreateResellerPOSOrder } from '@/actions/hooks/reseller'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import { OrderDocType } from '@/components/pdf/types'
import {
  CurrencyCode,
  OrderStatus,
  PaymentMethod,
} from '@/generated/prisma/enums'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useSession } from '@/hooks/use-session'
import { POSCheckoutInput } from '@/zod/order'

import { getQuickCashAmounts } from '../_lib/pos-cash'

interface UsePosCheckoutParams {
  open: boolean
  totalAmount: number
  earnedPoints: number
  agreementId?: string
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
}

export function usePosCheckout({
  open,
  totalAmount,
  earnedPoints,
  agreementId,
  onSuccess,
  onOpenChange,
}: UsePosCheckoutParams) {
  const t = useTranslations('merchant.pos.checkoutModal')
  const clearCart = useCartStore((state) => state.clearCart)
  const cartItems = useCartStore((state) => state.items)
  const { watch, setValue, handleSubmit, reset } =
    useFormContext<POSCheckoutInput>()

  const isResellerMode = Boolean(agreementId)
  const { user } = useSession()

  const currentStoreId = watch('storeId')
  const [shouldPrintReceipt, setShouldPrintReceipt] = useState(false)
  const [selectedDocType, setSelectedDocType] =
    useState<OrderDocType>('receipt-slip')

  const supplierStoreId = cartItems[0]?.supplierStoreId || cartItems[0]?.storeId
  const targetCheckStoreId =
    isResellerMode && supplierStoreId ? supplierStoreId : currentStoreId

  const { currency, currencyInfo, formatRawCurrency, convert } =
    useMerchantCurrency(targetCheckStoreId)

  const payableAmount = convert(totalAmount)
  const quickAmounts = useMemo(
    () => getQuickCashAmounts(payableAmount, currency),
    [payableAmount, currency],
  )

  const { data: isStripeAvailable = false } =
    usePaymentSettingStatus(targetCheckStoreId)

  const { mutate: createStandardOrder, isPending: isStandardPending } =
    useCreatePOSOrder()
  const { mutate: createResellerOrder, isPending: isResellerPending } =
    useCreateResellerPOSOrder()
  const storeCheckoutMutation = useStoreCheckout()

  const isPending =
    isStandardPending || isResellerPending || storeCheckoutMutation.isPending

  const paymentMethod = watch('paymentMethod')
  const receivedAmount = watch('receivedAmount') || 0

  useEffect(() => {
    if (open && isResellerMode) {
      setValue('paymentMethod', PaymentMethod.STRIPE_QR_PROMPTPAY)
      setValue('status', OrderStatus.PENDING)
    }
  }, [open, isResellerMode, setValue])

  const isCash =
    !isResellerMode && paymentMethod === PaymentMethod.CASH_ON_DELIVERY

  const isValidCash = isCash ? receivedAmount >= payableAmount : true
  const isCurrentPaymentValid = isCash
    ? isValidCash
    : paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY && isStripeAvailable

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (isResellerMode && method === PaymentMethod.CASH_ON_DELIVERY) {
      toast.error(t('resellerDirectTransferOnly'))
      return
    }

    if (method !== PaymentMethod.CASH_ON_DELIVERY && !isStripeAvailable) {
      toast.error(
        isResellerMode
          ? t('resellerStripeDisabled')
          : currency === CurrencyCode.THB
            ? t('stripeRequiredPromptPay')
            : t('stripeSystemNotReady'),
      )
      return
    }

    setValue('paymentMethod', method)
    setValue(
      'status',
      method === PaymentMethod.CASH_ON_DELIVERY
        ? OrderStatus.SHIPPED
        : OrderStatus.PENDING,
    )
  }

  const onSubmit = (data: POSCheckoutInput) => {
    if (!isCurrentPaymentValid) {
      if (
        !isStripeAvailable &&
        paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
      ) {
        toast.error(
          isResellerMode
            ? t('resellerPaymentSystemNotReady')
            : currency === CurrencyCode.THB
              ? t('promptPaySystemNotReady')
              : t('stripeSystemNotReady'),
        )
        return
      }
      if (isCash && !isValidCash) {
        toast.error(t('insufficientCashReceived'))
        return
      }
    }

    const handleSuccess = (res: {
      success: boolean
      data?: { id: string; orderNumber: string; totalAmount: number }
    }) => {
      if (res.success && res.data) {
        const createdOrder = res.data

        if (paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY) {
          toast.loading(t('redirectingStripe'))

          const successUrl = shouldPrintReceipt
            ? `${window.location.origin}/merchant/orders/${createdOrder.id}/print?type=${selectedDocType}`
            : `${window.location.origin}/merchant/orders`

          storeCheckoutMutation.mutate(
            {
              storeId: targetCheckStoreId,
              orderId: createdOrder.id,
              customerEmail: user?.email || 'guest@checkout.local',
              description: t('orderPaymentDescription', {
                orderNumber: createdOrder.orderNumber,
              }),
              amount: Number(createdOrder.totalAmount),
              currency,
              successUrl,
              cancelUrl: `${window.location.origin}/merchant/orders`,
            },
            {
              onSuccess: (checkoutRes) => {
                if (checkoutRes?.url) {
                  clearCart()
                  reset()
                  onSuccess()
                  onOpenChange(false)
                  window.location.href = checkoutRes.url
                } else {
                  toast.error(t('stripeLinkFailed'))
                }
              },
              onError: (err) => {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : t('stripeConnectionError'),
                )
              },
            },
          )
        } else {
          clearCart()
          reset()
          onSuccess()
          onOpenChange(false)

          if (shouldPrintReceipt) {
            const printUrl = `/merchant/orders/${createdOrder.id}/print?type=${selectedDocType}`
            window.open(printUrl, '_blank')
            toast.success(
              (toastItem) => (
                <div className="flex items-center justify-between gap-3">
                  <span>
                    {t('orderSuccessWithNumber', {
                      orderNumber: createdOrder.orderNumber,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(printUrl, '_blank')
                      toast.dismiss(toastItem.id)
                    }}
                    className="bg-primary text-primary-foreground rounded px-2.5 py-1 text-xs font-semibold hover:opacity-90"
                  >
                    {t('openDocument')}
                  </button>
                </div>
              ),
              { duration: 6000 },
            )
          }
        }
      }
    }

    if (isResellerMode && agreementId) {
      const resellerPayload = {
        agreementId,
        supplierStoreId: supplierStoreId || data.storeId,
        branchId: data.branchId,
        customerCurrency: currency,
        items: cartItems.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
      }

      createResellerOrder(resellerPayload, {
        onSuccess: handleSuccess,
      })
      return
    }

    const standardPayload = {
      storeId: data.storeId,
      branchId: data.branchId,
      customerId: data.customerId,
      customerCurrency: currency,
      usedPoints:
        data.usedPoints && data.usedPoints > 0 ? data.usedPoints : undefined,
      earnedPoints,
      status: isCash ? OrderStatus.SHIPPED : OrderStatus.PENDING,
      paymentMethod: isCash
        ? PaymentMethod.CASH_ON_DELIVERY
        : PaymentMethod.STRIPE_QR_PROMPTPAY,
      receivedAmount: isCash ? receivedAmount : undefined,
      changeAmount: isCash
        ? Math.max(0, receivedAmount - payableAmount)
        : undefined,
      discountAmount: data.discountAmount,
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variant.id,
        title: item.productTitle,
        variantTitle: item.variant.title || '',
        quantity: item.quantity,
        price: item.unitPrice,
        originalPrice: item.originalPrice ?? item.unitPrice,
        image: item.image || null,
        productType: item.productType,
        branchId: item.branchId || data.branchId,
      })),
    }

    createStandardOrder(standardPayload, {
      onSuccess: handleSuccess,
    })
  }

  return {
    isResellerMode,
    isPending,
    paymentMethod,
    isCash,
    isStripeAvailable,
    currency,
    currencySymbol: currencyInfo.symbol,
    formatRawCurrency,
    payableAmount,
    quickAmounts,
    receivedAmount,
    isCurrentPaymentValid,
    shouldPrintReceipt,
    setShouldPrintReceipt,
    selectedDocType,
    setSelectedDocType,
    handlePaymentMethodSelect,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
  }
}
