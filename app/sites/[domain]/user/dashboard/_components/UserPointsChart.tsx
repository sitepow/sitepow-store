'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { PointsHistoryItem } from '@/actions/storefront/dashboard'
import { AnalyticsCardShell } from '@/app/(main)/merchant/analytics/_components/_components/AnalyticsCardShell'
import { formatNumber } from '@/utils/pricing'
import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface UserPointsChartProps {
  pointsHistory: PointsHistoryItem[]
}

export function UserPointsChart({ pointsHistory }: UserPointsChartProps) {
  const t = useTranslations('customer.dashboard')

  const pointsChartConfig = useMemo(
    () =>
      ({
        earned: {
          label: t('earnedPointsLabel'),
          color: 'hsl(var(--chart-1))',
        },
        used: {
          label: t('usedPointsLabel'),
          color: 'hsl(var(--chart-2))',
        },
      }) satisfies ChartConfig,
    [t],
  )

  return (
    <AnalyticsCardShell
      title={t('pointsHistoryTitle')}
      description={t('pointsHistoryDesc')}
      isEmpty={!pointsHistory || pointsHistory.length === 0}
      emptyMessage={t('emptyPoints')}
    >
      <div className="space-y-4">
        <ChartContainer config={pointsChartConfig}>
          <AreaChart
            accessibilityLayer
            data={pointsHistory}
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
              tickFormatter={(value) => `${formatNumber(value)} P`}
              width={50}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="earned"
              type="monotone"
              fill="var(--color-earned)"
              fillOpacity={0.3}
              stroke="var(--color-earned)"
              strokeWidth={2}
            />
            <Area
              dataKey="used"
              type="monotone"
              fill="var(--color-used)"
              fillOpacity={0.2}
              stroke="var(--color-used)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="border-border/40 space-y-3 border-t pt-3">
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-1">
              <div className="flex items-center gap-2 leading-none font-medium">
                {t('pointsTip')}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                {t('last6Months')}
              </div>
            </div>
          </div>
          <div className="text-muted-foreground border-border/40 flex w-full flex-wrap items-center gap-4 border-t pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="shrink-0 rounded-md border border-green-200 bg-green-50 p-1 text-green-600 dark:border-green-900/50 dark:bg-green-950 dark:text-green-400">
                <IconArrowDownLeft size={14} />
              </div>
              <span>{t('earnedPointsLabel')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="shrink-0 rounded-md border border-red-200 bg-red-50 p-1 text-red-500 dark:border-red-900/50 dark:bg-red-950 dark:text-red-400">
                <IconArrowUpRight size={14} />
              </div>
              <span>{t('usedPointsLabel')}</span>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
