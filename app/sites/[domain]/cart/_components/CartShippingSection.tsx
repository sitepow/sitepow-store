'use client'

import { useTranslations } from 'next-intl'

import { IconArrowRight } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'

import { CheckoutSection } from './CheckoutSection'
import { RadioCard } from './RadioCard'

export interface ShippingMethodItem {
  id: string
  fee: number | null
  courierService: {
    name: string
    estimatedDays?: number | string | null
    courier: {
      name: string
    }
  }
}

interface CartShippingSectionProps {
  stepNumber: number
  isActive: boolean
  isCompleted: boolean
  isDisabled: boolean
  onEdit: () => void
  onContinue: () => void
  selectedShipping: string
  onSelectShipping: (shippingId: string) => void
  shippingOptions: ShippingMethodItem[]
  selectedShippingData?: ShippingMethodItem | null
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  currentCurrency?: string
}

export function CartShippingSection({
  stepNumber,
  isActive,
  isCompleted,
  isDisabled,
  onEdit,
  onContinue,
  selectedShipping,
  onSelectShipping,
  shippingOptions,
  selectedShippingData,
  formatCurrency,
  convert,
  currentCurrency,
}: CartShippingSectionProps) {
  const t = useTranslations('storefront.cart')

  return (
    <CheckoutSection
      title={`${stepNumber}. ${t('stepShippingTitle')}`}
      isActive={isActive}
      isCompleted={isCompleted}
      onEdit={onEdit}
      isDisabled={isDisabled}
    >
      <div className="space-y-4">
        {shippingOptions.length === 0 && (
          <ActionRequiredAlert
            title={t('errorTitle')}
            description={t('noShippingError')}
          />
        )}

        {shippingOptions.length > 0 && (
          <RadioGroup value={selectedShipping} onValueChange={onSelectShipping}>
            <div className="grid gap-2">
              {shippingOptions.map((method) => {
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
                          {formatCurrency(
                            convert(method.fee ?? 0),
                            currentCurrency,
                          )}
                        </span>{' '}
                        <br />
                        <span>
                          {t('deliveryTime')}{' '}
                          {method.courierService.estimatedDays
                            ? t('deliveryDaysEstimated', {
                                days: method.courierService.estimatedDays,
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
          onClick={onContinue}
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
                    ? formatCurrency(
                        convert(selectedShippingData.fee),
                        currentCurrency,
                      )
                    : t('notSupportWeight')}
                </span>{' '}
                <br />
                <span>
                  {t('deliveryTime')}{' '}
                  {selectedShippingData.courierService.estimatedDays
                    ? t('deliveryDaysEstimated', {
                        days: selectedShippingData.courierService.estimatedDays,
                      })
                    : selectedShippingData.courierService.courier.name}
                </span>
              </>
            }
          />
        </RadioGroup>
      )}
    </CheckoutSection>
  )
}
