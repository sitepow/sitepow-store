'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TableStatus } from '@/generated/prisma/enums'
import { RestaurantTableItem } from '@/types/restaurant'
import { IconArmchair, IconPlus, IconReceipt } from '@tabler/icons-react'

interface PosTableDetailDialogProps {
  table: RestaurantTableItem | null
  open: boolean
  onClose: () => void
  isPending: boolean
  onOpenTable: (table: RestaurantTableItem, guestCount: number) => void
  onOrderMore: (table: RestaurantTableItem) => void
  onSettleBill: () => void
}

export function PosTableDetailDialog({
  table,
  open,
  onClose,
  isPending,
  onOpenTable,
  onOrderMore,
  onSettleBill,
}: PosTableDetailDialogProps) {
  const [openGuestsCount, setOpenGuestsCount] = useState(2)

  if (!table) return null

  const sessionOrders = table.sessions?.[0]?.orders ?? []
  const tableBillTotal = sessionOrders.reduce(
    (sum: number, o) => sum + Number(o.totalAmount),
    0,
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-xl font-black">
              โต๊ะ {table.tableNumber}
            </DialogTitle>
            <Badge
              variant={
                table.status === TableStatus.AVAILABLE
                  ? 'outline'
                  : table.status === TableStatus.BILL_REQUESTED
                    ? 'destructive'
                    : 'default'
              }
              className={
                table.status === TableStatus.OCCUPIED
                  ? 'bg-amber-600 text-white'
                  : ''
              }
            >
              {table.status === TableStatus.AVAILABLE
                ? 'โต๊ะว่าง'
                : table.status === TableStatus.BILL_REQUESTED
                  ? 'ขอเช็คบิล'
                  : 'กำลังรับประทาน'}
            </Badge>
          </div>
          {table.zone?.name && (
            <CardDescription>
              โซน: {table.zone.name} • ความจุ: {table.seats} ที่นั่ง
            </CardDescription>
          )}
        </DialogHeader>

        {table.status === TableStatus.AVAILABLE ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guests">จำนวนลูกค้า (ท่าน)</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={50}
                value={openGuestsCount}
                onChange={(e) => setOpenGuestsCount(Number(e.target.value))}
              />
            </div>
            <Button
              className="h-11 w-full gap-1.5 font-bold"
              onClick={() => onOpenTable(table, openGuestsCount)}
              disabled={isPending}
            >
              <IconArmchair className="size-5" />
              {isPending ? 'กำลังเปิดโต๊ะ...' : 'เปิดโต๊ะ'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-muted/20 max-h-[260px] space-y-2 divide-y overflow-y-auto rounded-xl border p-3 pr-1">
              {sessionOrders.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  ยังไม่มีรายการอาหารสั่งในรอบนี้
                </p>
              ) : (
                sessionOrders.map((order) => (
                  <div key={order.id} className="space-y-1 pt-2 first:pt-0">
                    <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
                      <span>#{order.orderNumber}</span>
                      <span>฿{Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between pl-2 text-xs"
                      >
                        <span>
                          {item.quantity}x {item.title}
                          {item.customerNote && (
                            <span className="block text-[10px] text-amber-600">
                              ★ {item.customerNote}
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="bg-card flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-semibold">ยอดรวมทั้งสิ้น</span>
              <span className="text-primary text-xl font-black">
                ฿{tableBillTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                className="gap-1.5 font-bold"
                onClick={() => onOrderMore(table)}
              >
                <IconPlus className="size-4" />
                สั่งอาหารเพิ่ม
              </Button>
              <Button
                className="gap-1.5 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                onClick={onSettleBill}
              >
                <IconReceipt className="size-4" />
                เช็คบิล / รับเงิน
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
