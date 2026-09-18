'use client'

import { Button } from '@/components/ui/button'
import { TableStatus } from '@/generated/prisma/enums'
import { RestaurantTableItem } from '@/types/restaurant'
import { IconRefresh } from '@tabler/icons-react'

interface PosTableStatusSummaryProps {
  tables: RestaurantTableItem[]
  onRefresh: () => void
}

export function PosTableStatusSummary({
  tables,
  onRefresh,
}: PosTableStatusSummaryProps) {
  const availableCount = tables.filter(
    (t) => t.status === TableStatus.AVAILABLE,
  ).length
  const occupiedCount = tables.filter(
    (t) => t.status === TableStatus.OCCUPIED,
  ).length
  const billRequestedCount = tables.filter(
    (t) => t.status === TableStatus.BILL_REQUESTED,
  ).length

  return (
    <div className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
      <div className="flex items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="size-3 inline-block rounded-full bg-emerald-500" />
          ว่าง ({availableCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 inline-block rounded-full bg-amber-500" />
          มีลูกค้า ({occupiedCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 inline-block animate-pulse rounded-full bg-red-500" />
          เรียกเช็คบิล ({billRequestedCount})
        </span>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onRefresh}
        className="h-8 gap-1.5 text-xs"
      >
        <IconRefresh className="size-3.5" />
        รีเฟรชผังโต๊ะ
      </Button>
    </div>
  )
}

