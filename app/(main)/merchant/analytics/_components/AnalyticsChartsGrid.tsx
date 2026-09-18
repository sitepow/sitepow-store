'use client'

import { AnalyticsResult } from '@/actions/analytics'

import { CustomerRetentionCard } from './CustomerRetentionCard'
import { DayOfWeekTrendChart } from './DayOfWeekTrendChart'
import { FinancialTrendChart } from './FinancialTrendChart'
import { HeatmapChart } from './HeatmapChart'
import { PaymentBreakdownCard } from './PaymentBreakdownCard'
import { PeakHoursCard } from './PeakHoursCard'
import { TopProductPairsCard } from './TopProductPairsCard'
import { TopProductsCard } from './TopProductsCard'
import { TopVariantsCard } from './TopVariantsCard'

interface AnalyticsChartsGridProps {
  data: AnalyticsResult
}

export function AnalyticsChartsGrid({ data }: AnalyticsChartsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <FinancialTrendChart data={data.financialTrend ?? []} />
      <CustomerRetentionCard retention={data.customerRetention} />
      <TopProductsCard topProducts={data.topProducts ?? []} />
      <TopVariantsCard topVariants={data.topVariants ?? []} />
      <TopProductPairsCard topProductPairs={data.topProductPairs ?? []} />
      <PaymentBreakdownCard paymentBreakdown={data.paymentBreakdown ?? []} />
      <DayOfWeekTrendChart dayOfWeekTrend={data.dayOfWeekTrend ?? []} />
      <HeatmapChart heatmap={data.heatmap ?? []} />
      <PeakHoursCard topBuyingHours={data.topBuyingHours ?? []} />
    </div>
  )
}
