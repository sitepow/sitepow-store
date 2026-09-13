'use client'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
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

interface TopProductsCardProps {
  topProducts: Array<{
    name: string
    totalSales: number
    quantity: number
  }>
}

export function TopProductsCard({ topProducts }: TopProductsCardProps) {
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.analytics.topProducts')

  return (
    <AnalyticsCardShell
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
      title={t('title')}
      description={t('description')}
      isEmpty={topProducts.length === 0}
      emptyMessage={t('emptyMessage')}
    >
      <div className="h-70 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={topProducts}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="fill-muted-foreground text-xs"
              tickFormatter={(value) =>
                value.length > 8 ? `${value.slice(0, 8)}...` : value
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
                        {data.name}
                      </p>
                      <p className="font-medium text-orange-500">
                        {t('quantitySold', { quantity: data.quantity })}
                      </p>
                      <p className="text-muted-foreground">
                        {t('totalSales', {
                          totalSales: formatCurrency(data.totalSales),
                        })}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="quantity"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#quantityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCardShell>
  )
}
