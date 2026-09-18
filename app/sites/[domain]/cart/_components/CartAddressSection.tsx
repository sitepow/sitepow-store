'use client'

import { useTranslations } from 'next-intl'

import { IconArrowRight } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'

import { CheckoutSection } from './CheckoutSection'
import { CustomerAddressCreateDialog } from './CustomerAddressCreateDialog'
import { RadioCard } from './RadioCard'

export interface AddressOptionItem {
  id: string
  receiverName?: string | null
  name: string
  addressLine: string
  subDistrict?: string | null
  district?: string | null
  province: string
  isDefault?: boolean
}

interface CartAddressSectionProps {
  stepNumber: number
  isActive: boolean
  isCompleted: boolean
  isDisabled: boolean
  onEdit: () => void
  onContinue: () => void
  selectedAddress: string
  onSelectAddress: (addressId: string) => void
  addressOptions: AddressOptionItem[]
  selectedAddressData?: AddressOptionItem | null
}

export function CartAddressSection({
  stepNumber,
  isActive,
  isCompleted,
  isDisabled,
  onEdit,
  onContinue,
  selectedAddress,
  onSelectAddress,
  addressOptions,
  selectedAddressData,
}: CartAddressSectionProps) {
  const t = useTranslations('storefront.cart')

  return (
    <CheckoutSection
      title={`${stepNumber}. ${t('stepAddressTitle')}`}
      isActive={isActive}
      isCompleted={isCompleted}
      onEdit={onEdit}
      isDisabled={isDisabled}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-sm">
            {t('selectDeliveryAddress')}
          </span>
          <CustomerAddressCreateDialog />
        </div>

        {addressOptions.length === 0 && (
          <ActionRequiredAlert
            title={t('errorTitle')}
            description={t('noAddressError')}
          />
        )}

        {addressOptions.length > 0 && (
          <RadioGroup value={selectedAddress} onValueChange={onSelectAddress}>
            <div className="grid gap-2">
              {addressOptions.map((addr) => (
                <RadioCard
                  key={addr.id}
                  id={`addr-${addr.id}`}
                  value={addr.id}
                  title={`${addr.receiverName || ''} (${addr.name})`}
                  description={`${addr.addressLine} ${addr.subDistrict || ''} ${addr.district || ''} ${addr.province}`}
                />
              ))}
            </div>
          </RadioGroup>
        )}

        <Button
          className="w-full"
          variant="outline"
          disabled={!selectedAddressData}
          onClick={onContinue}
        >
          {t('continue')} <IconArrowRight />
        </Button>
      </div>

      {selectedAddressData && (
        <RadioGroup value={selectedAddress}>
          <RadioCard
            id={`summary-addr-${selectedAddressData.id}`}
            value={selectedAddressData.id}
            title={`${selectedAddressData.receiverName || ''} (${selectedAddressData.name})`}
            description={`${selectedAddressData.addressLine} ${selectedAddressData.subDistrict || ''} ${selectedAddressData.district || ''} ${selectedAddressData.province}`}
          />
        </RadioGroup>
      )}
    </CheckoutSection>
  )
}
