'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  useCustomerAffiliateDashboard,
  useRequestAffiliatePayout,
  useStorefrontAffiliateProducts,
  useUpdateCustomerAffiliateBank,
} from '@/actions/hooks/storefront/affiliate'
import { BUYER_NAVIGATION } from '@/constants/navigation'
import { CurrencyCode } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { formatCurrency } from '@/utils/pricing'
import { IconCoin } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { AffiliateHeroShareCard } from './_components/AffiliateHeroShareCard'
import { AffiliateLoadingSkeleton } from './_components/AffiliateLoadingSkeleton'
import { AffiliatePayoutDialog } from './_components/AffiliatePayoutDialog'
import { AffiliateStatsCards } from './_components/AffiliateStatsCards'
import { AffiliateTabsSection } from './_components/AffiliateTabsSection'

export default function StoreUserAffiliatePage() {
  const t = useTranslations('customer.affiliate')
  const params = useParams()
  const storeSlug = (params?.domain as string) || ''
  const { store } = useStoreData()
  const baseCurrency = (store as { baseCurrency?: CurrencyCode } | null)
    ?.baseCurrency
  const { currentCurrency, convert } = useStorefrontCurrency(baseCurrency)

  const { data, isLoading } = useCustomerAffiliateDashboard(storeSlug)
  const { data: products = [] } = useStorefrontAffiliateProducts(storeSlug)

  const requestPayoutMutation = useRequestAffiliatePayout()
  const updateBankMutation = useUpdateCustomerAffiliateBank()

  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('')
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)

  const account = data?.account
  const setting = data?.setting
  const stats = data?.stats
  const referrals = data?.referrals ?? []
  const payouts = data?.payouts ?? []

  const isEnabled = data?.isEnabled ?? setting?.isEnabled ?? false
  const isAuthenticated = data?.isAuthenticated ?? true
  const commissionRate = Number(setting?.defaultCommissionRate ?? 5)
  const minWithdrawal = Number(setting?.minWithdrawalAmount ?? 100)
  const availableBalance = stats?.availableBalance ?? 0

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const storeReferralLink = useMemo(() => {
    return account ? `${origin}/products?ref=${account.referralCode}` : ''
  }, [origin, account])

  const productReferralLink = useMemo(() => {
    return account && selectedProductSlug
      ? `${origin}/products/${selectedProductSlug}?ref=${account.referralCode}`
      : ''
  }, [origin, account, selectedProductSlug])

  const handleSubmitPayout = async (payload: {
    amount: number
    promptPayNumber: string
    bankName: string
    bankAccountNo: string
    bankAccountName: string
  }) => {
    const res = await requestPayoutMutation.mutateAsync({
      storeSlug,
      input: payload,
    })
    if (res.success) {
      setPayoutDialogOpen(false)
      toast.success(t('toasts.payoutSuccess'))
    }
  }

  const handleSaveBankInfo = async (payload: {
    promptPayNumber: string
    bankName: string
    bankAccountNo: string
    bankAccountName: string
  }) => {
    const res = await updateBankMutation.mutateAsync({
      storeSlug,
      input: payload,
    })
    if (res.success) {
      toast.success(t('toasts.bankSaved'))
    }
  }

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconCoin}
        title={t('title')}
        description={t('description')}
      />

      {isLoading ? (
        <AffiliateLoadingSkeleton />
      ) : !isEnabled ? (
        <ActionRequiredAlert
          title={t('disabledTitle')}
          description={t('disabledDesc')}
        />
      ) : !isAuthenticated ? (
        <ActionRequiredAlert
          title={t('unauthenticatedTitle')}
          description={t('unauthenticatedDesc')}
          action={
            <Button asChild className="font-bold shadow-xs">
              <Link href="/auth/login?redirect=/user/affiliate">
                {t('loginBtn')}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <AffiliateHeroShareCard
            commissionRate={commissionRate}
            referralCode={account?.referralCode}
            storeReferralLink={storeReferralLink}
            products={products}
            selectedProductSlug={selectedProductSlug}
            onSelectProductSlug={setSelectedProductSlug}
            productReferralLink={productReferralLink}
          />

          <AffiliateStatsCards
            availableBalance={availableBalance}
            pendingCommission={stats?.pendingCommission ?? 0}
            totalEarned={stats?.totalEarned ?? 0}
            totalWithdrawn={stats?.totalWithdrawn ?? 0}
            totalReferralsCount={stats?.totalReferralsCount ?? 0}
            minWithdrawal={minWithdrawal}
            formatCurrency={formatCurrency}
            convert={convert}
            currentCurrency={currentCurrency}
            onRequestPayout={() => setPayoutDialogOpen(true)}
          />

          <AffiliateTabsSection
            referrals={referrals}
            payouts={payouts}
            account={account}
            formatCurrency={formatCurrency}
            convert={convert}
            currentCurrency={currentCurrency}
            onSaveBankInfo={handleSaveBankInfo}
            isSavingBank={updateBankMutation.isPending}
          />

          <AffiliatePayoutDialog
            isOpen={payoutDialogOpen}
            onClose={() => setPayoutDialogOpen(false)}
            availableBalance={availableBalance}
            minWithdrawal={minWithdrawal}
            initialPromptPay={account?.promptPayNumber}
            initialBankName={account?.bankName}
            initialBankAccountNo={account?.bankAccountNo}
            initialBankAccountName={account?.bankAccountName}
            formatCurrency={formatCurrency}
            convert={convert}
            currentCurrency={currentCurrency}
            onSubmit={handleSubmitPayout}
            isSubmitting={requestPayoutMutation.isPending}
          />
        </div>
      )}
    </Sidebar>
  )
}
