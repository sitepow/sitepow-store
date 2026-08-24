'use client'

import { formatNumber } from '@/utils/pricing'
import { IconClock, IconCrown } from '@tabler/icons-react'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'
import { RankProgressBar } from './_components/RankProgressBar'

interface PeakHoursCardProps {
  topBuyingHours: Array<{
    hour: string
    count: number
  }>
}

export function PeakHoursCard({ topBuyingHours }: PeakHoursCardProps) {
  const maxCount = topBuyingHours[0]?.count || 1

  return (
    <AnalyticsCardShell
      title="5 อันดับ ช่วงเวลาขายดีที่สุด (Peak Hours)"
      description="ช่วงเวลาที่มีการสร้างออเดอร์สูงสุดโดยรวม"
      isEmpty={topBuyingHours.length === 0}
      emptyMessage="ไม่มีข้อมูลช่วงเวลาขายดี"
      className="lg:col-span-2"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topBuyingHours.map((item, idx) => {
          const isFirst = idx === 0
          const percentage = Math.round((item.count / maxCount) * 100)

          return (
            <div
              key={idx}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isFirst
                  ? 'via-card to-card border-orange-500/40 bg-linear-to-b from-orange-500/5 dark:from-orange-500/10'
                  : 'border-border/60 bg-card hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between pb-3">
                {isFirst ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <IconCrown className="size-3 fill-amber-500/30" />
                    อันดับ 1
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                    อันดับ {idx + 1}
                  </span>
                )}
                <IconClock className="text-muted-foreground/50 group-hover:text-muted-foreground size-3.5 transition-colors" />
              </div>
              <div className="my-1 space-y-1">
                <div className="text-foreground text-lg font-bold tracking-tight">
                  {item.hour}
                </div>
                <div className="text-primary flex items-baseline gap-1">
                  <span className="text-base font-extrabold">
                    {formatNumber(item.count)}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    ออเดอร์
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <RankProgressBar percentage={percentage} isFirst={isFirst} />
              </div>
            </div>
          )
        })}
      </div>
    </AnalyticsCardShell>
  )
}
