'use client'

import { useTranslations } from 'next-intl'

import { IconArrowRight, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'

import { CheckoutSection } from './CheckoutSection'
import { RadioCard } from './RadioCard'

export interface PaymentMethodOption {
  id: string
  title: string
  description?: string
}

interface CartPaymentSectionProps {
  stepNumber: number
  isActive: boolean
  isCompleted: boolean
  isDisabled: boolean
  onEdit: () => void
  onContinue: () => void
  selectedPayment: string
  onSelectPayment: (paymentId: string) => void
  paymentMethods: PaymentMethodOption[]
  selectedPaymentData?: PaymentMethodOption | null
  isDomesticThaiOrder: boolean
}

export function CartPaymentSection({
  stepNumber,
  isActive,
  isCompleted,
  isDisabled,
  onEdit,
  onContinue,
  selectedPayment,
  onSelectPayment,
  paymentMethods,
  selectedPaymentData,
  isDomesticThaiOrder,
}: CartPaymentSectionProps) {
  const t = useTranslations('storefront.cart')

  return (
    <CheckoutSection
      title={`${stepNumber}. ${t('stepPaymentTitle')}`}
      isActive={isActive}
      isCompleted={isCompleted}
      onEdit={onEdit}
      isDisabled={isDisabled}
    >
      <div className="space-y-3">
        {!isDomesticThaiOrder && paymentMethods.length > 0 && (
          <div className="border-primary/20 bg-primary/5 text-primary flex items-center gap-2 rounded-xl border p-3 text-xs">
            <IconLock size={16} className="shrink-0" />
            <span>
              การสั่งซื้อระหว่างประเทศรองรับการชำระเงินผ่านระบบสากล Stripe
              (บัตรเครดิต/เดบิต, Apple Pay, Google Pay) เท่านั้น
            </span>
          </div>
        )}

        {paymentMethods.length === 0 && (
          <ActionRequiredAlert
            title={t('errorTitle')}
            description={
              !isDomesticThaiOrder
                ? 'ร้านค้านี้ยังไม่ได้เปิดใช้งานการชำระเงินสากล (Stripe) สำหรับการสั่งซื้อระหว่างประเทศ'
                : t('noPaymentError')
            }
          />
        )}

        {paymentMethods.length > 0 && (
          <RadioGroup value={selectedPayment} onValueChange={onSelectPayment}>
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
          onClick={onContinue}
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
  )
}
