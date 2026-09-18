'use client'

import { useTranslations } from 'next-intl'

import { formatNumber } from '@/utils/pricing'
import {
  IconCoin,
  IconGift,
  IconReceipt2,
  IconWallet,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'
import { Button } from '@/components/ui/button'

interface AffiliateStatsCardsProps {
  availableBalance: number
  pendingCommission: number
  totalEarned: number
  totalWithdrawn: number
  totalReferralsCount: number
  minWithdrawal: number
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  currentCurrency?: string
  onRequestPayout: () => void
}

export function AffiliateStatsCards({
  availableBalance,
  pendingCommission,
  totalEarned,
  totalWithdrawn,
  totalReferralsCount,
  minWithdrawal,
  formatCurrency,
  convert,
  currentCurrency,
  onRequestPayout,
}: AffiliateStatsCardsProps) {
  const t = useTranslations('customer.affiliate')

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatsCard
        title={t('stats.availableBalance')}
        value={formatCurrency(convert(availableBalance), currentCurrency)}
        icon={IconWallet}
        className="border-primary/30"
        valueClassName="text-primary font-black"
        action={
          <Button
            size="sm"
            className="w-full font-bold shadow-xs"
            disabled={availableBalance < minWithdrawal}
            onClick={onRequestPayout}
          >
            {t('stats.requestPayout')}
          </Button>
        }
      />

      <StatsCard
        title={t('stats.pendingCommission')}
        value={formatCurrency(convert(pendingCommission), currentCurrency)}
        description={t('stats.pendingDesc')}
        icon={IconReceipt2}
      />

      <StatsCard
        title={t('stats.totalEarned')}
        value={formatCurrency(convert(totalEarned), currentCurrency)}
        description={t('stats.withdrawn', {
          amount: formatCurrency(convert(totalWithdrawn), currentCurrency),
        })}
        icon={IconCoin}
      />

      <StatsCard
        title={t('stats.totalReferredOrders')}
        value={`${formatNumber(totalReferralsCount)} ${t('stats.ordersUnit')}`}
        description={t('stats.referredOrdersDesc')}
        icon={IconGift}
      />
    </div>
  )
}
