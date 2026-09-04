'use client'

import { useTranslations } from 'next-intl'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface TopProductPairsCardProps {
  topProductPairs: Array<{
    pair: string
    count: number
  }>
}

export function TopProductPairsCard({
  topProductPairs,
}: TopProductPairsCardProps) {
  const t = useTranslations('merchant.analytics.topProductPairs')

  return (
    <AnalyticsCardShell
      title={t('title')}
      description={t('description')}
      isEmpty={topProductPairs.length === 0}
      emptyMessage={t('emptyMessage')}
    >
      <div className="h-70 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={topProductPairs}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="pairCountGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="pair"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="fill-muted-foreground text-xs"
              tickFormatter={(value) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground text-xs"
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="border-border/50 bg-background/95 space-y-1 rounded-lg border p-2.5 text-xs shadow-md backdrop-blur-sm">
                      <p className="text-foreground font-semibold">
                        {data.pair}
                      </p>
                      <p className="font-medium text-purple-500">
                        {t('boughtTogether', { count: data.count })}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#pairCountGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCardShell>
  )
}
