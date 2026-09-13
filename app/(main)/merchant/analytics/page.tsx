'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useAnalyticsAi } from '@/actions/hooks/ai'
import { useAnalyticsOverview } from '@/actions/hooks/analytics'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatNumber } from '@/utils/pricing'
import {
  IconArrowUpRight,
  IconChartBar,
  IconLock,
  IconReceipt,
  IconShoppingCart,
  IconSparkles,
  IconWallet,
} from '@tabler/icons-react'
import { format } from 'date-fns'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'

import { AiInsightsCard, AiInsightsData } from './_components/AiInsightsCard'
import { AnalyticsSkeleton } from './_components/AnalyticsSkeleton'
import { CustomerRetentionCard } from './_components/CustomerRetentionCard'
import { DayOfWeekTrendChart } from './_components/DayOfWeekTrendChart'
import { FinancialTrendChart } from './_components/FinancialTrendChart'
import { HeatmapChart } from './_components/HeatmapChart'
import { PaymentBreakdownCard } from './_components/PaymentBreakdownCard'
import { PeakHoursCard } from './_components/PeakHoursCard'
import { TopProductPairsCard } from './_components/TopProductPairsCard'
import { TopProductsCard } from './_components/TopProductsCard'
import { TopVariantsCard } from './_components/TopVariantsCard'

export default function AnalyticsPage() {
  const t = useTranslations('merchant.analytics')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { formatCurrency } = useMerchantCurrency()

  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd')
  })
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const { canViewDashboard, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const { data, isLoading } = useAnalyticsOverview(
    selectedStoreId,
    selectedBranchId,
    startDate,
    endDate,
  )

  const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null)

  const { mutate: generateAiInsights, isPending: isGeneratingAi } =
    useAnalyticsAi(selectedStoreId)

  const handleGenerateAiInsights = () => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES || !data) {
      return
    }

    generateAiInsights(data, {
      onSuccess: (res) => {
        if (res.success && res.data) {
          setAiInsights(res.data)
        } else {
          alert(res.message || t('aiButton.error'))
        }
      },
    })
  }

  const totalRevenue =
    data?.financialTrend.reduce((acc, curr) => acc + curr.revenue, 0) ?? 0
  const totalNetProfit =
    data?.financialTrend.reduce((acc, curr) => acc + curr.netProfit, 0) ?? 0
  const totalOrders =
    data?.dayOfWeekTrend.reduce((acc, curr) => acc + curr.orderCount, 0) ?? 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconChartBar}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="flex items-end gap-2">
              <div className="w-36">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder={t('dateRange.startDatePlaceholder')}
                />
              </div>
              <span className="text-muted-foreground text-sm">-</span>
              <div className="w-36">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder={t('dateRange.endDatePlaceholder')}
                />
              </div>
            </div>
            <StoreSelectField />
            <BranchSelectField />
            <Button
              onClick={handleGenerateAiInsights}
              disabled={isGeneratingAi || isLoading || !data}
              className="gap-2"
            >
              <IconSparkles className="size-4" />
              {isGeneratingAi
                ? t('aiButton.generating')
                : t('aiButton.generate')}
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
        {selectedStoreId !== ALL_STORES &&
          (isPermissionLoading || isLoading) && <AnalyticsSkeleton />}
        {selectedStoreId !== ALL_STORES &&
          !isPermissionLoading &&
          !canViewDashboard && (
            <ActionRequiredAlert
              icon={<IconLock />}
              title={t('noAccessTitle')}
              description={t('noAccessDescription')}
            />
          )}
        {selectedStoreId !== ALL_STORES &&
          !isPermissionLoading &&
          canViewDashboard &&
          !isLoading &&
          data && (
            <div className="space-y-6">
              {aiInsights && <AiInsightsCard aiInsights={aiInsights} />}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatsCard
                  title={t('overviewStats.totalRevenue')}
                  value={formatCurrency(totalRevenue)}
                  description={t('overviewStats.totalRevenueDesc')}
                  icon={IconWallet}
                />
                <StatsCard
                  title={t('overviewStats.netProfit')}
                  value={formatCurrency(totalNetProfit)}
                  description={t('overviewStats.netProfitDesc')}
                  icon={IconArrowUpRight}
                />
                <StatsCard
                  title={t('overviewStats.totalOrders')}
                  value={t('overviewStats.ordersUnit', {
                    count: formatNumber(totalOrders),
                  })}
                  description={t('overviewStats.totalOrdersDesc')}
                  icon={IconShoppingCart}
                />
                <StatsCard
                  title={t('overviewStats.aov')}
                  value={formatCurrency(averageOrderValue)}
                  description={t('overviewStats.aovDesc')}
                  icon={IconReceipt}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <FinancialTrendChart data={data?.financialTrend ?? []} />
                <CustomerRetentionCard retention={data?.customerRetention} />
                <TopProductsCard topProducts={data?.topProducts ?? []} />
                <TopVariantsCard topVariants={data?.topVariants ?? []} />
                <TopProductPairsCard
                  topProductPairs={data?.topProductPairs ?? []}
                />
                <PaymentBreakdownCard
                  paymentBreakdown={data?.paymentBreakdown ?? []}
                />
                <DayOfWeekTrendChart
                  dayOfWeekTrend={data?.dayOfWeekTrend ?? []}
                />
                <HeatmapChart heatmap={data?.heatmap ?? []} />
                <PeakHoursCard topBuyingHours={data?.topBuyingHours ?? []} />
              </div>
            </div>
          )}
      </div>
    </Sidebar>
  )
}
