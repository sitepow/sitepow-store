'use client'

import { useTranslations } from 'next-intl'
import {
  IconFilePlus,
  IconPlus,
  IconReceiptRefund,
} from '@tabler/icons-react'

import { ResellerAgreementSelectField } from '@/components/ResellerAgreementSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'
import { ALL_STORES } from '@/stores/use-store-filter'

interface ResellerHeaderActionsProps {
  mainTab: 'consignment' | 'affiliate'
  selectedStoreId: string
  selectedAgreementId?: string
  canCreateReseller: boolean
  isPosReseller: boolean
  isSupplier: boolean
  canUpdateFinance: boolean
  onCreateAgreement: () => void
  onAllocateStock: () => void
  onRecordPayout: () => void
}

export function ResellerHeaderActions({
  mainTab,
  selectedStoreId,
  selectedAgreementId,
  canCreateReseller,
  isPosReseller,
  isSupplier,
  canUpdateFinance,
  onCreateAgreement,
  onAllocateStock,
  onRecordPayout,
}: ResellerHeaderActionsProps) {
  const t = useTranslations('merchant.reseller')

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <StoreSelectField />
      {mainTab === 'consignment' && (
        <>
          <ResellerAgreementSelectField
            mode="all"
            disabled={selectedStoreId === ALL_STORES}
          />
          {canCreateReseller && !isPosReseller && (
            <Button
              variant="outline"
              onClick={onCreateAgreement}
              disabled={selectedStoreId === ALL_STORES}
            >
              <IconFilePlus />
              {t('newAgreement')}
            </Button>
          )}
          {canCreateReseller && isSupplier && (
            <Button
              onClick={onAllocateStock}
              disabled={!selectedAgreementId}
            >
              <IconPlus />
              {t('allocateStock')}
            </Button>
          )}
          {canUpdateFinance && isSupplier && (
            <Button
              variant="outline"
              onClick={onRecordPayout}
              disabled={!selectedAgreementId}
            >
              <IconReceiptRefund />
              {t('recordPayout')}
            </Button>
          )}
        </>
      )}
    </div>
  )
}

