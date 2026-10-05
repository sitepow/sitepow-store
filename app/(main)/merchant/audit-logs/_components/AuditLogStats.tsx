'use client'

import { useActivityLogStats } from '@/actions/analytics/activity-log/hooks'
import {
  IconActivity,
  IconCalendarEvent,
  IconFlame,
  IconUsers,
} from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { ActionBadge } from './ActionBadge'

interface AuditLogStatsProps {
  storeId: string
}

export function AuditLogStats({ storeId }: AuditLogStatsProps) {
  const { data: stats, isLoading } = useActivityLogStats(storeId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border shadow-none">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      title: 'บันทึกกิจกรรมทั้งหมด',
      value: stats?.totalCount?.toLocaleString() ?? '0',
      description: 'Log ประวัติการกระทำทั้งหมด',
      icon: IconActivity,
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'กิจกรรมวันนี้',
      value: stats?.todayCount?.toLocaleString() ?? '0',
      description: 'รายการที่เกิดขึ้นในรอบวัน',
      icon: IconCalendarEvent,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'ผู้ดำเนินการที่เกี่ยวข้อง',
      value: `${stats?.activeActorsCount?.toLocaleString() ?? '0'} คน`,
      description: 'พนักงานและผู้ดูแลระบบ',
      icon: IconUsers,
      colorClass: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'กิจกรรมยอดนิยม',
      valueNode: stats?.topAction ? (
        <div className="pt-0.5">
          <ActionBadge action={stats.topAction} />
        </div>
      ) : (
        <span className="text-sm font-medium text-muted-foreground">-</span>
      ),
      description: 'ประเภทการกระทำที่พบมากที่สุด',
      icon: IconFlame,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, idx) => {
        const IconComponent = item.icon
        return (
          <Card
            key={idx}
            className="group relative overflow-hidden border bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-xs"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {item.title}
                </span>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border ${item.colorClass} shrink-0`}
                >
                  <IconComponent size={15} />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                {item.valueNode ?? (
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    {item.value}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
