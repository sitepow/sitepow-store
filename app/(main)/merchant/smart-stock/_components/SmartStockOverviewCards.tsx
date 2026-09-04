'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MOCK_SMART_STOCK_STATS } from '@/constants/smart-stock'
import { formatNumber } from '@/utils/pricing'
import { Boxes, CheckCircle2, RefreshCw, Store } from 'lucide-react'

export function SmartStockOverviewCards() {
  const t = useTranslations('merchant.smartStock.cards')
  const stats = MOCK_SMART_STOCK_STATS

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        title={t('totalStock')}
        value={`${formatNumber(stats.totalStockUnits)} ${t('pieces')}`}
        description={t('totalSkus', { count: stats.totalSkus })}
        icon={Boxes}
      />
      <StatsCard
        title={t('mainWarehouse')}
        value={`${formatNumber(stats.channels.local.totalUnits)} ${t('pieces')}`}
        description={t('mainWarehouseDesc')}
        icon={Store}
      />
      <StatsCard
        title={t('connectedChannels')}
        value={t('platforms', { count: 3 })}
        description={t('connectedChannelsDesc')}
        icon={RefreshCw}
      />
      <StatsCard
        title={t('stockAccuracy')}
        value={`${stats.syncedPercentage}%`}
        description={t('stockAccuracyDesc', {
          synced: 5,
          mismatch: stats.mismatchCount,
        })}
        icon={CheckCircle2}
      />
    </div>
  )
}
