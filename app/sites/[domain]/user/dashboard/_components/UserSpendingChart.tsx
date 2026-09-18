'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { SpendingTrendItem } from '@/actions/storefront/dashboard'
import { AnalyticsCardShell } from '@/app/(main)/merchant/analytics/_components/_components/AnalyticsCardShell'
import { CurrencyCode } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface UserSpendingChartProps {
  spendingTrend: SpendingTrendItem[]
  convert: (amount: number) => number
  currentCurrency: CurrencyCode
}

export function UserSpendingChart({
  spendingTrend,
  convert,
  currentCurrency,
}: UserSpendingChartProps) {
  const t = useTranslations('customer.dashboard')

  const lastMonth = spendingTrend[spendingTrend.length - 1]?.total ?? 0
  const prevMonth = spendingTrend[spendingTrend.length - 2]?.total ?? 0
  const isSpendingUp = lastMonth >= prevMonth

  const spendingChartConfig = useMemo(
    () =>
      ({
        total: {
          label: t('totalSpent'),
          color: 'hsl(var(--primary))',
        },
      }) satisfies ChartConfig,
    [t],
  )

  return (
    <AnalyticsCardShell
      title={t('spendingHistoryTitle')}
      description={t('spendingHistoryDesc')}
      isEmpty={!spendingTrend || spendingTrend.length === 0}
      emptyMessage={t('emptySpending')}
    >
      <div className="space-y-4">
        <ChartContainer config={spendingChartConfig}>
          <AreaChart
            accessibilityLayer
            data={spendingTrend}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#888888"
              fontSize={12}
              tickFormatter={(value) =>
                formatCurrency(convert(value), currentCurrency)
              }
              width={60}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="total"
              type="natural"
              fill="var(--color-total)"
              fillOpacity={0.4}
              stroke="var(--color-total)"
            />
          </AreaChart>
        </ChartContainer>
        <div className="border-border/40 flex w-full items-start gap-2 border-t pt-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isSpendingUp ? t('spendingUp') : t('spendingDown')}{' '}
              {isSpendingUp ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {t('last6Months')}
            </div>
          </div>
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
