'use client'

import { useTranslations } from 'next-intl'

import { StatsCard } from '@/components/StatsCard'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconGift,
  IconReceipt2,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'

interface AffiliateOverviewCardsProps {
  stats?: {
    totalSales: number
    totalCommissionPaid: number
    pendingPayoutAmount: number
    pendingPayoutCount: number
    totalAffiliates: number
  } | null
  isLoading: boolean
}

export function AffiliateOverviewCards({
  stats,
  isLoading,
}: AffiliateOverviewCardsProps) {
  const t = useTranslations('merchant.reseller.affiliate')

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatsCard
        title={t('stats.totalSales')}
        value={formatCurrency(stats?.totalSales ?? 0)}
        description={t('stats.totalSalesDesc')}
        icon={IconGift}
      />
      <StatsCard
        title={t('stats.totalCommissionPaid')}
        value={formatCurrency(stats?.totalCommissionPaid ?? 0)}
        description={t('stats.totalCommissionPaidDesc')}
        icon={IconWallet}
      />
      <StatsCard
        title={t('stats.pendingPayout')}
        value={formatCurrency(stats?.pendingPayoutAmount ?? 0)}
        description={t('stats.pendingPayoutDesc', {
          count: stats?.pendingPayoutCount ?? 0,
        })}
        icon={IconReceipt2}
      />
      <StatsCard
        title={t('stats.totalAffiliates')}
        value={`${formatNumber(stats?.totalAffiliates ?? 0)}`}
        description={t('stats.totalAffiliatesDesc')}
        icon={IconUsers}
      />
    </div>
  )
}

