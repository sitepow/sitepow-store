'use client'

import { useTranslations } from 'next-intl'

import { GetStorefrontDashboardStats } from '@/actions/storefront/dashboard'
import { CurrencyCode } from '@/generated/prisma/enums'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { Award, CreditCard, ShoppingBag, Ticket } from 'lucide-react'

import { StatsCard } from '@/components/StatsCard'

interface UserDashboardStatsProps {
  stats?: GetStorefrontDashboardStats
  convert: (amount: number) => number
  currentCurrency: CurrencyCode
}

export function UserDashboardStats({
  stats,
  convert,
  currentCurrency,
}: UserDashboardStatsProps) {
  const t = useTranslations('customer.dashboard')

  if (!stats) return null

  const statsItems = [
    {
      title: t('totalSpentStore'),
      value: formatCurrency(convert(stats.totalSpent), currentCurrency),
      description: t('totalSpentDesc'),
      icon: CreditCard,
    },
    {
      title: t('rewardPoints'),
      value: `${formatNumber(stats.rewardPoints)} ${t('pointsUnit')}`,
      description: t('rewardPointsDesc'),
      icon: Award,
    },
    {
      title: t('totalOrders'),
      value: formatNumber(stats.totalOrders),
      description: t('pendingOrders', { count: stats.pendingOrders }),
      icon: ShoppingBag,
    },
    {
      title: t('availableCoupons'),
      value: `${formatNumber(stats.availableCoupons)} ${t('couponsUnit')}`,
      description: t('availableCouponsDesc'),
      icon: Ticket,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statsItems.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  )
}
