'use client'

import { TableStatus } from '@/generated/prisma/enums'
import { RestaurantTableItem } from '@/types/restaurant'

interface PosTableGridCardProps {
  table: RestaurantTableItem
  onSelect: (table: RestaurantTableItem) => void
}

export function PosTableGridCard({ table, onSelect }: PosTableGridCardProps) {
  const isAvailable = table.status === TableStatus.AVAILABLE
  const isOccupied = table.status === TableStatus.OCCUPIED
  const isBillReq = table.status === TableStatus.BILL_REQUESTED

  const activeOrders = table.sessions?.[0]?.orders ?? []
  const activeTotal = activeOrders.reduce(
    (sum: number, o) => sum + Number(o.totalAmount),
    0,
  )

  return (
    <button
      type="button"
      onClick={() => onSelect(table)}
      className={`flex min-h-[135px] flex-col justify-between rounded-2xl border-2 p-3.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
        isBillReq
          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
          : isOccupied
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500'
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-foreground text-lg font-black tracking-tight">
            {table.tableNumber}
          </span>
          <span className="text-muted-foreground text-[11px]">
            {table.seats} ที่
          </span>
        </div>
        {table.zone?.name && (
          <span className="text-muted-foreground line-clamp-1 text-[10px]">
            {table.zone.name}
          </span>
        )}
      </div>

      <div className="border-border/50 mt-2 border-t pt-2">
        {isAvailable ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ● ว่าง
          </span>
        ) : (
          <div>
            <div className="text-foreground text-xs font-extrabold">
              ฿{activeTotal.toLocaleString()}
            </div>
            <span
              className={`text-[10px] font-bold ${
                isBillReq ? 'animate-pulse text-red-600' : 'text-amber-600'
              }`}
            >
              {isBillReq
                ? '🔔 เรียกเช็คบิล'
                : `${activeOrders.length} ออเดอร์`}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
