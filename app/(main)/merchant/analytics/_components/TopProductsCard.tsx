'use client'

import { formatCurrency } from '@/utils/pricing'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'
import { RankListItem } from './_components/RankListItem'

interface TopProductsCardProps {
  topProducts: Array<{
    name: string
    totalSales: number
    quantity: number
  }>
}

export function TopProductsCard({ topProducts }: TopProductsCardProps) {
  const maxQuantity = topProducts[0]?.quantity || 1

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
      case 1:
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
      case 2:
        return 'bg-amber-700/15 text-amber-800 dark:text-amber-300 border border-amber-700/30'
      default:
        return 'bg-muted text-muted-foreground border border-transparent'
    }
  }

  return (
    <AnalyticsCardShell
      title="5 อันดับสินค้าขายดีที่สุด (Top Products)"
      description="เรียงตามจำนวนชิ้นที่ขายได้"
      isEmpty={topProducts.length === 0}
      emptyMessage="ไม่มีข้อมูลสินค้า"
    >
      <div className="space-y-3.5">
        {topProducts.map((item, idx) => {
          const percentage = Math.round((item.quantity / maxQuantity) * 100)

          return (
            <RankListItem
              key={idx}
              rank={idx}
              percentage={percentage}
              quantityOrCount={item.quantity}
              unitText="ชิ้น"
              getRankStyle={getRankStyle}
              crownColorClass="fill-orange-500/30 text-orange-600 dark:text-orange-400"
              firstGradientClass="bg-linear-to-r from-orange-500 to-amber-500"
              normalBarClass="bg-orange-500/70"
            >
              <div className="truncate">
                <p className="text-foreground text-sm font-semibold transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  {item.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  ยอดขายรวม{' '}
                  <span className="text-foreground/80 font-medium">
                    {formatCurrency(item.totalSales)}
                  </span>
                </p>
              </div>
            </RankListItem>
          )
        })}
      </div>
    </AnalyticsCardShell>
  )
}
