'use client'

import { IconLink } from '@tabler/icons-react'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'
import { RankListItem } from './_components/RankListItem'

interface TopProductPairsCardProps {
  topProductPairs: Array<{
    pair: string
    count: number
  }>
}

export function TopProductPairsCard({
  topProductPairs,
}: TopProductPairsCardProps) {
  const maxCount = topProductPairs[0]?.count || 1

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
      case 1:
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
      case 2:
        return 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-transparent'
    }
  }

  const renderPairNames = (pairString: string) => {
    const separator = pairString.includes('+')
      ? '+'
      : pairString.includes('&')
        ? '&'
        : pairString.includes(',')
          ? ','
          : null

    if (!separator) {
      return (
        <p className="text-foreground text-sm font-semibold transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
          {pairString}
        </p>
      )
    }

    const [item1, ...rest] = pairString.split(separator)
    const item2 = rest.join(separator)

    return (
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:flex-nowrap">
        <span className="text-foreground text-sm font-semibold transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
          {item1.trim()}
        </span>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
          <IconLink className="h-2.5 w-2.5" />
        </span>
        <span className="text-foreground text-sm font-semibold transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
          {item2.trim()}
        </span>
      </div>
    )
  }

  return (
    <AnalyticsCardShell
      title="คู่สินค้าที่มักจะถูกซื้อร่วมกัน (Top Product Pairs)"
      description="วิเคราะห์สินค้าที่ถูกสั่งซื้อพร้อมกันในออเดอร์เดียวกันบ่อยที่สุด"
      isEmpty={topProductPairs.length === 0}
      emptyMessage="ไม่มีข้อมูลการซื้อร่วมกัน"
    >
      <div className="space-y-3.5">
        {topProductPairs.map((item, idx) => {
          const percentage = Math.round((item.count / maxCount) * 100)

          return (
            <RankListItem
              key={idx}
              rank={idx}
              percentage={percentage}
              quantityOrCount={item.count}
              unitText="ออเดอร์"
              getRankStyle={getRankStyle}
              crownColorClass="fill-purple-500/30 text-purple-600 dark:text-purple-400"
              firstGradientClass="bg-linear-to-r from-purple-500 to-indigo-500"
              normalBarClass="bg-purple-500/70"
            >
              <div className="min-w-0 flex-1">{renderPairNames(item.pair)}</div>
            </RankListItem>
          )
        })}
      </div>
    </AnalyticsCardShell>
  )
}
