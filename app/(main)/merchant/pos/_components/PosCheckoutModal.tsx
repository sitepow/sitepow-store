'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useStoreCheckout } from '@/actions/hooks/checkout'
import { usePaymentSettingStatus } from '@/actions/hooks/payment'
import { useCreatePOSOrder } from '@/actions/hooks/pos/order'
import { useCreateResellerPOSOrder } from '@/actions/hooks/reseller'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import {
  CurrencyCode,
  OrderStatus,
  PaymentMethod,
} from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useSession } from '@/hooks/use-session'
import { formatNumber } from '@/utils/pricing'
import { POSCheckoutInput } from '@/zod/order'
import {
  IconCash,
  IconCreditCard,
  IconExternalLink,
  IconFileInvoice,
  IconPackageExport,
  IconPrinter,
  IconQrcode,
  IconReceipt,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { OrderDocType } from '@/components/pdf/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { cn } from '@/lib/utils'

import { DigitalPriceDisplay } from './DigitalPriceDisplay'

function getQuickCashAmounts(
  payableAmount: number,
  currency: CurrencyCode,
): number[] {
  let denoms = [10, 20, 50, 100, 500, 1000]
  if (currency === CurrencyCode.THB) {
    denoms = [100, 500, 1000]
  } else if (currency === CurrencyCode.JPY) {
    denoms = [1000, 5000, 10000]
  } else if (currency === CurrencyCode.KRW) {
    denoms = [5000, 10000, 50000]
  } else if (currency === CurrencyCode.VND) {
    denoms = [50000, 100000, 500000]
  } else if (
    ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'CHF'].includes(currency)
  ) {
    denoms = [5, 10, 20, 50, 100]
  }

  const higher = denoms.filter((d) => d > payableAmount)
  if (higher.length >= 3) {
    return higher.slice(0, 3)
  }
  if (higher.length > 0) {
    const last = higher[higher.length - 1]
    const result = [...higher]
    let next = last * 2
    while (result.length < 3) {
      result.push(next)
      next += last
    }
    return result
  }
  const step = denoms[denoms.length - 1]
  const base = Math.ceil(payableAmount / step) * step
  return [base, base + step, base + step * 2]
}

interface PosCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  earnedPoints: number
  agreementId?: string
  onSuccess: () => void
}

export function PosCheckoutModal({
  open,
  onOpenChange,
  totalAmount,
  earnedPoints,
  agreementId,
  onSuccess,
}: PosCheckoutModalProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.pos.checkoutModal')
  const tCart = useTranslations('merchant.pos.cart')
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

  const { currency, currencyInfo, formatCurrency, formatRawCurrency, convert } =
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

  const changeAmount = receivedAmount - payableAmount
  const isValidCash = isCash ? receivedAmount >= payableAmount : true

  const isCurrentPaymentValid = isCash
    ? isValidCash
    : paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY && isStripeAvailable

  const handleQuickAmount = (amount: number) => {
    setValue('receivedAmount', amount)
  }

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
      changeAmount: isCash ? Math.max(0, changeAmount) : undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        showCloseButton={false}
        className="overflow-x-hidden p-0"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DigitalPriceDisplay
            value={totalAmount}
            size="lg"
            className="rounded-none border-x-0 border-t-0"
          />
          <div className="space-y-5 px-5 pt-4">
            <DialogHeader className="p-0 text-left">
              <DialogHeaderIcon
                icon={IconCash}
                title={t('selectPaymentMethod')}
              />
            </DialogHeader>
            <div
              className={cn(
                'grid gap-3',
                isResellerMode ? 'grid-cols-1' : 'sm:grid-cols-2',
              )}
            >
              {!isResellerMode && (
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodSelect(PaymentMethod.CASH_ON_DELIVERY)
                  }
                  className={cn(
                    'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                    isCash
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  <IconCash className="size-7" />
                  <span className="text-sm">{t('cash')}</span>
                </button>
              )}
              {isStripeAvailable ? (
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodSelect(PaymentMethod.STRIPE_QR_PROMPTPAY)
                  }
                  className={cn(
                    'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                    paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {currency === CurrencyCode.THB ? (
                    <IconQrcode className="size-7" />
                  ) : (
                    <IconCreditCard className="size-7" />
                  )}
                  <span className="text-sm">
                    {currency === CurrencyCode.THB
                      ? isResellerMode
                        ? t('resellerPromptPay')
                        : t('promptPay')
                      : t('stripeCard')}
                  </span>
                </button>
              ) : (
                <div className="border-border text-muted-foreground bg-muted/20 relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-3 text-center">
                  {currency === CurrencyCode.THB ? (
                    <IconQrcode className="text-muted-foreground/60 size-6" />
                  ) : (
                    <IconCreditCard className="text-muted-foreground/60 size-6" />
                  )}
                  <span className="text-xs font-medium">
                    {isResellerMode
                      ? t('resellerPaymentUnavailable')
                      : currency === CurrencyCode.THB
                        ? t('promptPayUnavailable')
                        : t('stripeCardUnavailable')}
                  </span>
                  {!isResellerMode && (
                    <Link
                      href="http://lvh.me:3000/merchant/settings?tab=settings-payment"
                      target="_blank"
                      className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
                    >
                      {t('setupPayment')}
                      <IconExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
            {isCash && (
              <div className="bg-muted/30 border-border/80 space-y-4 rounded-xl border p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {t('receivedAmount')}
                    </Label>
                    {receivedAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => setValue('receivedAmount', 0)}
                        className="text-muted-foreground hover:text-foreground text-xs underline"
                      >
                        {t('clearAmount')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={payableAmount}
                      value={receivedAmount || ''}
                      onChange={(e) =>
                        setValue('receivedAmount', Number(e.target.value))
                      }
                      autoFocus
                      placeholder="0.00"
                      className="h-12 pr-12 text-right text-xl font-bold tracking-wide"
                    />
                    <span className="text-muted-foreground absolute top-3 right-3 text-sm font-semibold">
                      {currencyInfo.symbol}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 font-medium"
                    onClick={() => handleQuickAmount(payableAmount)}
                  >
                    {t('exactAmount')}
                  </Button>
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 font-medium"
                      onClick={() => handleQuickAmount(amt)}
                    >
                      {formatNumber(amt)}
                    </Button>
                  ))}
                </div>
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3.5 transition-all',
                    receivedAmount > 0 && !isValidCash
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-background border',
                  )}
                >
                  <span className="text-sm font-medium">
                    {receivedAmount > 0 && !isValidCash
                      ? t('insufficientAmount')
                      : t('change')}
                  </span>
                  <span
                    className={cn(
                      'text-xl font-extrabold',
                      receivedAmount > 0 && !isValidCash
                        ? 'text-destructive'
                        : 'text-primary',
                    )}
                  >
                    {receivedAmount > 0
                      ? formatRawCurrency(Math.abs(changeAmount))
                      : '-'}
                  </span>
                </div>
              </div>
            )}
            <div className="bg-muted/30 border-border/80 space-y-3 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="print-receipt-toggle"
                  className="text-foreground flex cursor-pointer items-center gap-2.5 text-sm font-semibold select-none"
                >
                  <Checkbox
                    id="print-receipt-toggle"
                    checked={shouldPrintReceipt}
                    onCheckedChange={(checked) =>
                      setShouldPrintReceipt(Boolean(checked))
                    }
                  />
                  <div className="flex items-center gap-1.5">
                    <IconPrinter className="text-primary size-4" />
                    <span>{t('printReceiptImmediate')}</span>
                  </div>
                </label>
              </div>
              {shouldPrintReceipt && (
                <div className="border-border/60 space-y-1.5 border-t pt-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('receipt-slip')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                        selectedDocType === 'receipt-slip'
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <IconReceipt className="size-3.5" />
                      <span>{t('receiptSlip')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('receipt')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                        selectedDocType === 'receipt'
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <IconReceipt className="size-3.5" />
                      <span>{t('receiptA4')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('tax-invoice')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                        selectedDocType === 'tax-invoice'
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <IconFileInvoice className="size-3.5" />
                      <span>{t('taxInvoice')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('delivery-note')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                        selectedDocType === 'delivery-note'
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <IconPackageExport className="size-3.5" />
                      <span>{t('deliveryNote')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="bg-muted/20 mt-5 gap-2 border-t p-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {tCart('cancel')}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !isCurrentPaymentValid}
              className="w-full min-w-40 gap-1.5 font-bold sm:w-auto"
            >
              {isPending ? (
                t('connecting')
              ) : paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY ? (
                t('goToPayment')
              ) : (
                <>
                  {shouldPrintReceipt && <IconPrinter className="size-4" />}
                  <span>
                    {shouldPrintReceipt
                      ? t('confirmAndPrint')
                      : t('confirmPayment')}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
