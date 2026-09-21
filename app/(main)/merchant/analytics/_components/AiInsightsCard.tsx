'use client'

import {
  IconClock,
  IconPackage,
  IconSparkles,
  IconTarget,
} from '@tabler/icons-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface AiInsightsData {
  businessSummary: string
  operatingHoursStrategy: {
    recommendedStartHour: string
    peakHoursNotice: string
    actionPlan: string
  }
  productAndBundlingStrategy: {
    topProductInsight: string
    bundleSuggestions: Array<{
      pairName: string
      promotionIdea: string
    }>
  }
  retentionAndMarketingStrategy: {
    customerInsight: string
    actionableSteps: string[]
  }
}

interface AiInsightsCardProps {
  aiInsights: AiInsightsData
}

export function AiInsightsCard({ aiInsights }: AiInsightsCardProps) {
  return (
    <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <IconSparkles className="size-5 shrink-0" />
          บทวิเคราะห์และกลยุทธ์จาก AI (AI Business Insights)
        </CardTitle>
        <CardDescription>{aiInsights.businessSummary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card space-y-1 rounded-lg border p-3">
            <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
              <IconClock className="size-4 shrink-0" /> กลยุทธ์เวลาเปิด-ปิดร้าน
            </div>
            <p className="text-xs font-bold">
              เวลาที่ควรเปิด:{' '}
              {aiInsights.operatingHoursStrategy.recommendedStartHour}
            </p>
            <p className="text-muted-foreground text-xs">
              {aiInsights.operatingHoursStrategy.peakHoursNotice}
            </p>
            <p className="text-muted-foreground text-xs font-medium">
              {aiInsights.operatingHoursStrategy.actionPlan}
            </p>
          </div>
          <div className="bg-card space-y-1 rounded-lg border p-3">
            <div className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400">
              <IconPackage className="size-4 shrink-0" /> การดันยอดสินค้า &
              โปรโมชั่น
            </div>
            <p className="text-muted-foreground text-xs">
              {aiInsights.productAndBundlingStrategy.topProductInsight}
            </p>
            {aiInsights.productAndBundlingStrategy.bundleSuggestions.map(
              (bundle, idx) => (
                <div key={idx} className="mt-1 text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {bundle.pairName}:
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {bundle.promotionIdea}
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="bg-card space-y-1 rounded-lg border p-3">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <IconTarget className="size-4 shrink-0" /> การดึงดูดลูกค้าเดิม
            </div>
            <p className="text-muted-foreground text-xs">
              {aiInsights.retentionAndMarketingStrategy.customerInsight}
            </p>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="mb-2 text-xs font-semibold">
            ข้อแนะนำที่ร้านค้าควรปรับทำทันที (Action Items):
          </p>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
            {aiInsights.retentionAndMarketingStrategy.actionableSteps.map(
              (step, idx) => (
                <li key={idx}>{step}</li>
              ),
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
