'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { IconArmchair } from '@tabler/icons-react'

import {
  useOpenTableSession,
  useRestaurantTables,
  useSettleTableBill,
} from '@/actions/hooks/restaurant'
import { restaurantTableKeys } from '@/actions/query-keys/restaurant'
import { Card } from '@/components/ui/card'
import { PaymentMethod } from '@/generated/prisma/enums'
import { RestaurantTableItem } from '@/types/restaurant'

import { PosTableDetailDialog } from './PosTableDetailDialog'
import { PosTableGridCard } from './PosTableGridCard'
import { PosTableSettleDialog } from './PosTableSettleDialog'
import { PosTableStatusSummary } from './PosTableStatusSummary'

interface PosTableGridProps {
  storeId: string
  branchId?: string
  onSelectTableForOrder: (table: RestaurantTableItem) => void
}

export function PosTableGrid({
  storeId,
  branchId,
  onSelectTableForOrder,
}: PosTableGridProps) {
  const queryClient = useQueryClient()
  const { data: tables = [], isLoading, refetch } = useRestaurantTables({
    storeId,
    branchId,
  })

  const openSessionMutation = useOpenTableSession()
  const settleBillMutation = useSettleTableBill()

  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL')
  const [activeTable, setActiveTable] = useState<RestaurantTableItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)

  const zones = useMemo(() => {
    const zoneMap = new Map<string, { id: string; name: string }>()
    tables.forEach((t) => {
      if (t.zone) {
        zoneMap.set(t.zone.id, { id: t.zone.id, name: t.zone.name })
      }
    })
    return Array.from(zoneMap.values())
  }, [tables])

  const filteredTables = useMemo(() => {
    if (selectedZoneId === 'ALL') return tables
    return tables.filter((t) => t.zoneId === selectedZoneId)
  }, [tables, selectedZoneId])

  const handleOpenTable = (
    table: RestaurantTableItem,
    guestCount: number,
  ) => {
    openSessionMutation.mutate(
      {
        tableId: table.id,
        storeId,
        guestCount,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('เปิดโต๊ะสำเร็จ')
            queryClient.invalidateQueries({
              queryKey: restaurantTableKeys.list({ storeId }),
            })
            setDetailOpen(false)
          } else {
            toast.error(
              ('messageTH' in res && res.messageTH) ||
              ('message' in res && (res as any).message) ||
              'เกิดข้อผิดพลาด',
            )
          }
        },
      },
    )
  }

  const handleConfirmSettle = (
    paymentMethod: PaymentMethod,
    receivedAmount?: number,
  ) => {
    if (!activeTable) return

    settleBillMutation.mutate(
      {
        tableId: activeTable.id,
        storeId,
        paymentMethod,
        receivedAmount,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('เช็คบิลโต๊ะสำเร็จ')
            queryClient.invalidateQueries({
              queryKey: restaurantTableKeys.list({ storeId }),
            })
            setSettleOpen(false)
            setDetailOpen(false)
          } else {
            toast.error(
              ('messageTH' in res && res.messageTH) ||
              ('message' in res && (res as any).message) ||
              'เกิดข้อผิดพลาด',
            )
          }
        },
      },
    )
  }

  const handleCardSelect = (table: RestaurantTableItem) => {
    setActiveTable(table)
    setDetailOpen(true)
  }

  const isPending =
    openSessionMutation.isPending || settleBillMutation.isPending

  return (
    <div className="space-y-4">
      {/* Top Status and Refresh Bar */}
      <PosTableStatusSummary tables={tables} onRefresh={() => refetch()} />

      {/* Zone Filters */}
      {zones.length > 0 && (
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedZoneId('ALL')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedZoneId === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            ทั้งหมด ({tables.length})
          </button>
          {zones.map((zone) => {
            const count = tables.filter((t) => t.zoneId === zone.id).length
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedZoneId === zone.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                {zone.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <Card className="py-16 text-center">
          <IconArmchair className="text-muted-foreground mx-auto mb-3 size-10 opacity-40" />
          <p className="text-muted-foreground text-sm">ไม่พบโต๊ะในหมวดนี้</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredTables.map((table) => (
            <PosTableGridCard
              key={table.id}
              table={table}
              onSelect={handleCardSelect}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <PosTableDetailDialog
        table={activeTable}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        isPending={isPending}
        onOpenTable={handleOpenTable}
        onOrderMore={(table) => {
          onSelectTableForOrder(table)
          setDetailOpen(false)
        }}
        onSettleBill={() => {
          setSettleOpen(true)
        }}
      />

      {/* Settle Dialog */}
      <PosTableSettleDialog
        table={activeTable}
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        isPending={isPending}
        onConfirmSettle={handleConfirmSettle}
      />
    </div>
  )
}
