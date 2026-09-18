'use client'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { formatNumber } from '@/utils/pricing'
import { IconArrowUpRight, IconUserCheck, IconUsers } from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface CustomerRetentionCardProps {
  retention?: {
    totalUniqueCustomers: number
    newCustomersCount: number
    returningCustomersCount: number
    repeatPurchaseRate: number
  }
}

export function CustomerRetentionCard({
  retention,
}: CustomerRetentionCardProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.analytics.customerRetention')

  return (
    <div
      className="flex flex-col gap-5"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <AnalyticsCardShell
        title={t('title')}
        description={t('description')}
        className="lg:col-span-2"
      />
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title={t('totalCustomers')}
          value={t('customerUnit', {
            count: formatNumber(retention?.totalUniqueCustomers ?? 0),
          })}
          description={t('totalCustomersDesc')}
          icon={IconUsers}
        />
        <StatsCard
          title={t('newCustomers')}
          value={t('customerUnit', {
            count: formatNumber(retention?.newCustomersCount ?? 0),
          })}
          description={t('newCustomersDesc')}
          icon={IconUserCheck}
        />
        <StatsCard
          title={t('returningCustomers')}
          value={t('customerUnit', {
            count: formatNumber(retention?.returningCustomersCount ?? 0),
          })}
          description={t('returningCustomersDesc')}
          icon={IconUserCheck}
        />
        <StatsCard
          title={t('repeatPurchaseRate')}
          value={`${retention?.repeatPurchaseRate ?? 0}%`}
          description={t('repeatPurchaseRateDesc')}
          icon={IconArrowUpRight}
        />
      </div>
    </div>
  )
}
