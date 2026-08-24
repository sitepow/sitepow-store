'use client'

import { DAYS, HOURS } from '@/constants/system'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface HeatmapChartProps {
  heatmap: Array<{
    dayOfWeek: number
    hour: number
    count: number
  }>
}

export function HeatmapChart({ heatmap }: HeatmapChartProps) {
  const maxOrderInHeatmap = Math.max(...(heatmap.map((h) => h.count) ?? [1]), 1)

  const getHeatmapColor = (count: number) => {
    if (count === 0) {
      return 'bg-muted/30 text-muted-foreground'
    }

    const intensity = count / maxOrderInHeatmap

    if (intensity < 0.25) {
      return 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200'
    }

    if (intensity < 0.5) {
      return 'bg-blue-300 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
    }

    if (intensity < 0.75) {
      return 'bg-blue-500 text-white font-bold'
    }

    return 'bg-blue-700 text-white font-bold animate-pulse'
  }

  return (
    <AnalyticsCardShell
      title="Heatmap ช่วงเวลาขายดี (Day x Hour Matrix)"
      description="ระดับสีเข้มแสดงถึงช่วงเวลาที่มีจำนวนคำสั่งซื้อหนาแน่นที่สุดในสัปดาห์"
      isEmpty={heatmap.length === 0}
      emptyMessage="ไม่มีข้อมูล Heatmap การขาย"
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto">
        <div className="min-w-175">
          <div className="mb-2 grid grid-cols-[80px_repeat(24,1fr)] gap-1 text-center text-xs font-semibold">
            <div>วัน / เวลา</div>
            {HOURS.map((h) => (
              <div key={h}>{String(h).padStart(2, '0')}</div>
            ))}
          </div>
          {DAYS.map((dayLabel, dayIdx) => (
            <div
              key={dayIdx}
              className="mb-1 grid grid-cols-[80px_repeat(24,1fr)] items-center gap-1"
            >
              <div className="text-muted-foreground text-xs font-medium">
                {dayLabel}
              </div>
              {HOURS.map((hour) => {
                const cell = heatmap.find(
                  (h) => h.dayOfWeek === dayIdx && h.hour === hour,
                )
                const count = cell?.count ?? 0
                return (
                  <div
                    key={hour}
                    title={`${dayLabel} ${hour}:00 - ${count} ออเดอร์`}
                    className={`flex h-8 items-center justify-center rounded text-[10px] transition-all ${getHeatmapColor(
                      count,
                    )}`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
