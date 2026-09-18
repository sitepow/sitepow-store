'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconCash } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { useCurrentStore } from '@/hooks/use-current-store'

import { usePosCheckout } from '../_hooks/use-pos-checkout'
import { DigitalPriceDisplay } from './DigitalPriceDisplay'
import { PosCashPaymentSection } from './PosCashPaymentSection'
import { PosPaymentMethodSelector } from './PosPaymentMethodSelector'
import { PosReceiptPrintSelector } from './PosReceiptPrintSelector'

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

  const {
    isResellerMode,
    isPending,
    paymentMethod,
    isCash,
    isStripeAvailable,
    currency,
    currencySymbol,
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
    handleSubmit,
    setValue,
  } = usePosCheckout({
    open,
    totalAmount,
    earnedPoints,
    agreementId,
    onSuccess,
    onOpenChange,
  })

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
        <form onSubmit={handleSubmit}>
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

            <PosPaymentMethodSelector
              isResellerMode={isResellerMode}
              paymentMethod={paymentMethod}
              isStripeAvailable={isStripeAvailable}
              currency={currency}
              onSelectMethod={handlePaymentMethodSelect}
            />

            {isCash && (
              <PosCashPaymentSection
                payableAmount={payableAmount}
                receivedAmount={receivedAmount}
                quickAmounts={quickAmounts}
                currencySymbol={currencySymbol}
                formatRawCurrency={formatRawCurrency}
                onAmountChange={(amt) => setValue('receivedAmount', amt)}
                onClear={() => setValue('receivedAmount', 0)}
              />
            )}

            {!isResellerMode && (
              <PosReceiptPrintSelector
                shouldPrintReceipt={shouldPrintReceipt}
                onShouldPrintReceiptChange={setShouldPrintReceipt}
                selectedDocType={selectedDocType}
                onSelectDocType={setSelectedDocType}
              />
            )}
          </div>

          <DialogFooter className="bg-muted/40 mt-6 border-t p-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCart('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!isCurrentPaymentValid || isPending}
            >
              {t('payAmount', {
                amount: formatRawCurrency(payableAmount),
              })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
