'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import {
  IconCoin,
  IconReceipt2,
  IconUsers,
} from '@tabler/icons-react'

import {
  useMerchantAffiliatePayouts,
  useMerchantAffiliateReferrals,
  useMerchantAffiliateStats,
  useMerchantAffiliates,
  useStoreAffiliateSetting,
  useUpdateAffiliateReferralStatus,
  useUpdateStoreAffiliateSetting,
} from '@/actions/hooks/affiliate'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  AffiliatePayoutItem,
} from '@/types/affiliate'

import { AffiliateAccountsTab } from './AffiliateAccountsTab'
import { AffiliateHeaderBar } from './AffiliateHeaderBar'
import { AffiliateOverviewCards } from './AffiliateOverviewCards'
import { AffiliatePayoutsTab } from './AffiliatePayoutsTab'
import { AffiliateReferralsTab } from './AffiliateReferralsTab'
import { ApproveAffiliatePayoutDialog } from './ApproveAffiliatePayoutDialog'

interface AffiliateManagementViewProps {
  storeId: string
  storeSlug?: string
}

export function AffiliateManagementView({
  storeId,
  storeSlug,
}: AffiliateManagementViewProps) {
  const t = useTranslations('merchant.reseller.affiliate')
  const { selectedStoreSlug } = useStoreFilter()
  const effectiveStoreSlug = storeSlug || selectedStoreSlug || ''

  const [activeTab, setActiveTab] = useState('affiliates')
  const [search, setSearch] = useState('')
  const [selectedPayout, setSelectedPayout] =
    useState<AffiliatePayoutItem | null>(null)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)

  // Data fetching
  const { data: setting, isLoading: isSettingLoading } =
    useStoreAffiliateSetting(storeId)
  const { mutate: updateSetting, isPending: isUpdatingSetting } =
    useUpdateStoreAffiliateSetting()

  const { data: stats, isLoading: isStatsLoading } =
    useMerchantAffiliateStats(storeId)
  const { data: affiliatesRes, isLoading: isAffiliatesLoading } =
    useMerchantAffiliates(storeId)
  const { data: payoutsRes, isLoading: isPayoutsLoading } =
    useMerchantAffiliatePayouts(storeId)
  const { data: referralsRes, isLoading: isReferralsLoading } =
    useMerchantAffiliateReferrals(storeId)
  const { mutate: updateReferralStatus } = useUpdateAffiliateReferralStatus()

  const affiliates = (affiliatesRes as { data?: any[] })?.data ?? []
  const payouts = (payoutsRes as { data?: any[] })?.data ?? []
  const referrals = (referralsRes as { data?: any[] })?.data ?? []

  const handleToggleActive = (enabled: boolean) => {
    updateSetting(
      {
        storeId,
        input: {
          isEnabled: enabled,
          defaultCommissionRate: setting?.defaultCommissionRate ?? 5,
          minWithdrawalAmount: setting?.minWithdrawalAmount ?? 100,
          cookieDurationDays: setting?.cookieDurationDays ?? 30,
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(
              enabled ? t('settingEnableSuccess') : t('settingDisableSuccess'),
            )
          } else {
            toast.error(res.message || t('settingUpdateFailed'))
          }
        },
      },
    )
  }

  const handleApproveReferral = (id: string) => {
    updateReferralStatus(
      { referralId: id, status: 'APPROVED' },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(t('referralApproveSuccess'))
          } else {
            toast.error(res.message || t('referralActionFailed'))
          }
        },
      },
    )
  }

  const handleRejectReferral = (id: string) => {
    updateReferralStatus(
      { referralId: id, status: 'REJECTED' },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(t('referralRejectSuccess'))
          } else {
            toast.error(res.message || t('referralActionFailed'))
          }
        },
      },
    )
  }

  const handleManagePayout = (payout: AffiliatePayoutItem) => {
    setSelectedPayout(payout)
    setPayoutDialogOpen(true)
  }

  const pendingPayoutCount = payouts.filter(
    (p) => p.status === 'PENDING',
  ).length

  return (
    <div className="space-y-6">
      {/* Program Settings Header Bar */}
      <AffiliateHeaderBar
        isEnabled={setting?.isEnabled ?? false}
        commissionRate={setting?.defaultCommissionRate ?? 0}
        isLoading={isSettingLoading}
        isPending={isUpdatingSetting}
        onToggleEnabled={handleToggleActive}
        onOpenSettings={() => {}}
      />

      {/* Overview Analytics Cards */}
      <AffiliateOverviewCards stats={stats} isLoading={isStatsLoading} />

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/60 h-10 w-full justify-start rounded-xl p-1 sm:w-auto">
          <TabsTrigger
            value="affiliates"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <IconUsers className="size-4" />
            {t('tabAffiliates')}
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {affiliates.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <IconCoin className="size-4" />
            {t('tabPayouts')}
            {pendingPayoutCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 px-1.5 text-[10px]"
              >
                {pendingPayoutCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="referrals"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <IconReceipt2 className="size-4" />
            {t('tabReferrals')}
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {referrals.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Affiliates List */}
        <AffiliateAccountsTab
          affiliates={affiliates}
          isLoading={isAffiliatesLoading}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Tab 2: Payout Requests */}
        <AffiliatePayoutsTab
          payouts={payouts}
          isLoading={isPayoutsLoading}
          onManagePayout={handleManagePayout}
        />

        {/* Tab 3: Referrals Log */}
        <AffiliateReferralsTab
          referrals={referrals}
          isLoading={isReferralsLoading}
          onApproveReferral={handleApproveReferral}
          onRejectReferral={handleRejectReferral}
        />
      </Tabs>

      {/* Payout Action Dialog */}
      <ApproveAffiliatePayoutDialog
        open={payoutDialogOpen}
        onOpenChange={setPayoutDialogOpen}
        payout={selectedPayout}
        storeId={storeId}
      />
    </div>
  )
}
