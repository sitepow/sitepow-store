'use client'

import { useTranslations } from 'next-intl'

import { CurrencyCode } from '@/generated/prisma/enums'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AffiliateBankForm } from './AffiliateBankForm'
import { AffiliatePayoutsTable, PayoutItem } from './AffiliatePayoutsTable'
import {
  AffiliateReferralsTable,
  ReferralItem,
} from './AffiliateReferralsTable'

interface AffiliateTabsSectionProps {
  referrals: ReferralItem[]
  payouts: PayoutItem[]
  account?: {
    promptPayNumber?: string | null
    bankName?: string | null
    bankAccountNo?: string | null
    bankAccountName?: string | null
  } | null
  formatCurrency: (amount: number) => string
  convert: (amount: number) => number
  currentCurrency: CurrencyCode
  onSaveBankInfo: (payload: {
    promptPayNumber: string
    bankName: string
    bankAccountNo: string
    bankAccountName: string
  }) => Promise<void>
  isSavingBank: boolean
}

export function AffiliateTabsSection({
  referrals,
  payouts,
  account,
  formatCurrency,
  convert,
  currentCurrency,
  onSaveBankInfo,
  isSavingBank,
}: AffiliateTabsSectionProps) {
  const t = useTranslations('customer.affiliate')

  return (
    <Tabs defaultValue="referrals" className="w-full">
      <TabsList className="bg-muted/60 grid w-full max-w-md grid-cols-3">
        <TabsTrigger
          value="referrals"
          className="text-xs font-semibold sm:text-sm"
        >
          {t('tabs.referrals', { count: referrals.length })}
        </TabsTrigger>
        <TabsTrigger
          value="payouts"
          className="text-xs font-semibold sm:text-sm"
        >
          {t('tabs.payouts', { count: payouts.length })}
        </TabsTrigger>
        <TabsTrigger value="bank" className="text-xs font-semibold sm:text-sm">
          {t('tabs.bank')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="referrals" className="pt-4">
        <AffiliateReferralsTable
          referrals={referrals}
          formatCurrency={formatCurrency}
          convert={convert}
          currentCurrency={currentCurrency}
        />
      </TabsContent>

      <TabsContent value="payouts" className="pt-4">
        <AffiliatePayoutsTable
          payouts={payouts}
          formatCurrency={formatCurrency}
          convert={convert}
          currentCurrency={currentCurrency}
        />
      </TabsContent>

      <TabsContent value="bank" className="pt-4">
        <AffiliateBankForm
          initialPromptPay={account?.promptPayNumber}
          initialBankName={account?.bankName}
          initialBankAccountNo={account?.bankAccountNo}
          initialBankAccountName={account?.bankAccountName}
          onSave={onSaveBankInfo}
          isSaving={isSavingBank}
        />
      </TabsContent>
    </Tabs>
  )
}
