'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useAnalyticsAi } from '@/actions/hooks/ai'
import { useAnalyticsOverview } from '@/actions/hooks/analytics'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconChartBar, IconLock } from '@tabler/icons-react'
import { format } from 'date-fns'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { AiInsightsCard, AiInsightsData } from './_components/AiInsightsCard'
import { AnalyticsChartsGrid } from './_components/AnalyticsChartsGrid'
import { AnalyticsHeaderActions } from './_components/AnalyticsHeaderActions'
import { AnalyticsOverviewStats } from './_components/AnalyticsOverviewStats'
import { AnalyticsSkeleton } from './_components/AnalyticsSkeleton'

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
    if (!selectedStoreId || selectedStoreId === ALL_STORES || !data) return

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
          <AnalyticsHeaderActions
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onGenerateAi={handleGenerateAiInsights}
            isGeneratingAi={isGeneratingAi}
            isAiDisabled={isGeneratingAi || isLoading || !data}
          />
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

              <AnalyticsOverviewStats
                totalRevenue={totalRevenue}
                totalNetProfit={totalNetProfit}
                totalOrders={totalOrders}
                averageOrderValue={averageOrderValue}
                formatCurrency={formatCurrency}
              />

              <AnalyticsChartsGrid data={data} />
            </div>
          )}
      </div>
    </Sidebar>
  )
}
