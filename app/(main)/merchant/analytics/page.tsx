'use client'

import { useState } from 'react'

import { useAnalyticsAi } from '@/actions/ai/ai/hooks'
import { useAnalyticsOverview } from '@/actions/analytics/analytics/hooks'
import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import {
  IconArrowUpRight,
  IconLock,
  IconReceipt,
  IconShoppingCart,
  IconSparkles,
  IconWallet,
} from '@tabler/icons-react'
import { format } from 'date-fns'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
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
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

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
          alert(res.message || 'เกิดข้อผิดพลาดในการสร้างคำแนะนำจาก AI')
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              วิเคราะห์ภาพรวม
            </h1>
            <p className="text-muted-foreground text-sm">
              วิเคราะห์แนวโน้มกำไร วันขายดี Peak Hours สินค้าขายดี
              และพฤติกรรมลูกค้า
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="flex items-end gap-2">
              <div className="w-36">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="เริ่มวันที่"
                />
              </div>
              <span className="text-muted-foreground text-sm">-</span>
              <div className="w-36">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="ถึงวันที่"
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
                ? 'กำลังวิเคราะห์กลยุทธ์...'
                : 'สรุปกลยุทธ์ด้วย AI'}
            </Button>
          </div>
        </div>
        {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
        {selectedStoreId !== ALL_STORES &&
          (isPermissionLoading || isLoading) && <AnalyticsSkeleton />}
        {selectedStoreId !== ALL_STORES &&
          !isPermissionLoading &&
          !canViewDashboard && (
            <ActionRequiredAlert
              icon={<IconLock />}
              title="ไม่มีสิทธิ์เข้าถึง"
              description="คุณไม่มีสิทธิ์ในการดูข้อมูลการวิเคราะห์ของสาขาหรือร้านค้านี้"
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
                  title="ยอดขายรวม"
                  value={formatCurrency(totalRevenue)}
                  description="ยอดขายสะสมตามช่วงเวลา"
                  icon={IconWallet}
                />
                <StatsCard
                  title="กำไรสุทธิ"
                  value={formatCurrency(totalNetProfit)}
                  description="หักต้นทุนและค่าใช้จ่ายแล้ว"
                  icon={IconArrowUpRight}
                />
                <StatsCard
                  title="ออเดอร์ทั้งหมด"
                  value={`${formatNumber(totalOrders)} รายการ`}
                  description="จำนวนคำสั่งซื้อสำเร็จ"
                  icon={IconShoppingCart}
                />
                <StatsCard
                  title="ยอดเฉลี่ย/บิล (AOV)"
                  value={formatCurrency(averageOrderValue)}
                  description="ยอดใช้จ่ายต่อออเดอร์"
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
