'use client'

import { useActivityLogStats } from '@/actions/analytics/activity-log/hooks'
import { StatsCard } from '@/app/sites/[domain]/_components/shared/StatsCard'
import {
  IconActivity,
  IconCalendarEvent,
  IconFlame,
  IconUsers,
} from '@tabler/icons-react'

import { ActionBadge } from './ActionBadge'

interface AuditLogStatsProps {
  storeId: string
}

export function AuditLogStats({ storeId }: AuditLogStatsProps) {
  const { data: stats, isLoading } = useActivityLogStats(storeId)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        title="บันทึกกิจกรรมทั้งหมด"
        value={stats?.totalCount?.toLocaleString() ?? '0'}
        description="Log ประวัติการกระทำทั้งหมด"
        icon={IconActivity}
        loading={isLoading}
      />
      <StatsCard
        title="กิจกรรมวันนี้"
        value={stats?.todayCount?.toLocaleString() ?? '0'}
        description="รายการที่เกิดขึ้นในรอบวัน"
        icon={IconCalendarEvent}
        loading={isLoading}
      />
      <StatsCard
        title="ผู้ดำเนินการที่เกี่ยวข้อง"
        value={
          stats?.activeActorsCount !== undefined
            ? `${stats.activeActorsCount.toLocaleString()} คน`
            : '0 คน'
        }
        description="พนักงานและผู้ดูแลระบบ"
        icon={IconUsers}
        loading={isLoading}
      />
      <StatsCard
        title="กิจกรรมยอดนิยม"
        value={
          stats?.topAction ? (
            <div className="pt-0.5">
              <ActionBadge action={stats.topAction} />
            </div>
          ) : (
            '-'
          )
        }
        description="ประเภทการกระทำที่พบมากที่สุด"
        icon={IconFlame}
        loading={isLoading}
      />
    </div>
  )
}
