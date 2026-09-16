'use client'

import { useEffect, useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import {
  IconArmchair,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconNote,
  IconPlus,
  IconQrcode,
  IconReceipt,
  IconRefresh,
  IconToolsKitchen2,
  IconUsers,
  IconX,
} from '@tabler/icons-react'

import {
  closeTableSession,
  getRestaurantTables,
  openTableSession,
} from '@/actions/restaurant/table'
import { settleTableBill } from '@/actions/restaurant/order'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaymentMethod, TableStatus } from '@/generated/prisma/enums'

interface PosTableGridProps {
  storeId: string
  branchId: string
  onSelectTableForOrder?: (table: any) => void
}

export function PosTableGrid({
  storeId,
  branchId,
  onSelectTableForOrder,
}: PosTableGridProps) {
  const [tables, setTables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Selected table modal
  const [selectedTable, setSelectedTable] = useState<any | null>(null)
  const [openGuestsCount, setOpenGuestsCount] = useState(2)

  // Settle bill modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH_ON_DELIVERY,
  )
  const [receivedAmount, setReceivedAmount] = useState<string>('')

  const loadTables = async () => {
    if (!storeId || !branchId) return
    setIsLoading(true)
    try {
      const res = await getRestaurantTables({ storeId, branchId })
      if (res.success && res.data) {
        setTables(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTables()
    const interval = setInterval(loadTables, 8000)
    return () => clearInterval(interval)
  }, [storeId, branchId])

  const handleOpenTable = (table: any) => {
    startTransition(async () => {
      const res = await openTableSession({
        tableId: table.id,
        guestCount: openGuestsCount,
      })
      if (res.success) {
        toast.success(res.messageTH)
        setSelectedTable(null)
        loadTables()
      } else {
        toast.error(res.messageTH)
      }
    })
  }

  const handleSettleBill = () => {
    if (!selectedTable) return
    startTransition(async () => {
      const res = await settleTableBill({
        tableId: selectedTable.id,
        paymentMethod,
        receivedAmount: receivedAmount ? Number(receivedAmount) : undefined,
      })
      if (res.success) {
        toast.success(res.messageTH, { duration: 4000 })
        setIsCheckoutOpen(false)
        setSelectedTable(null)
        setReceivedAmount('')
        loadTables()
      } else {
        toast.error(res.messageTH)
      }
    })
  }

  // Calculate table session bill
  const sessionOrders = selectedTable?.sessions?.[0]?.orders ?? []
  const tableBillTotal = sessionOrders.reduce(
    (sum: number, o: any) => sum + Number(o.totalAmount),
    0,
  )

  const numReceived = Number(receivedAmount || 0)
  const changeAmount = Math.max(0, numReceived - tableBillTotal)

  return (
    <div className="space-y-4">
      {/* Top Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-emerald-500 inline-block" />
            ว่าง ({tables.filter((t) => t.status === TableStatus.AVAILABLE).length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-amber-500 inline-block" />
            มีลูกค้า ({tables.filter((t) => t.status === TableStatus.OCCUPIED).length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-red-500 inline-block animate-pulse" />
            เรียกเช็คบิล (
            {tables.filter((t) => t.status === TableStatus.BILL_REQUESTED).length})
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadTables}
          className="gap-1.5 h-8 text-xs"
        >
          <IconRefresh className="size-3.5" />
          รีเฟรชผังโต๊ะ
        </Button>
      </div>

      {/* Grid of Tables */}
      {isLoading && tables.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-3">
            <IconArmchair className="size-12 mx-auto text-muted-foreground opacity-50" />
            <CardTitle>ยังไม่มีโต๊ะอาหารในสาขานี้</CardTitle>
            <CardDescription>
              ไปที่เมนู "โต๊ะอาหาร & QR" เพื่อสร้างโต๊ะและออกป้าย QR Code
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {tables.map((table) => {
            const isAvailable = table.status === TableStatus.AVAILABLE
            const isOccupied = table.status === TableStatus.OCCUPIED
            const isBillReq = table.status === TableStatus.BILL_REQUESTED

            const activeOrders = table.sessions?.[0]?.orders ?? []
            const activeTotal = activeOrders.reduce(
              (sum: number, o: any) => sum + Number(o.totalAmount),
              0,
            )

            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[135px] ${
                  isBillReq
                    ? 'border-red-500 bg-red-500/10 shadow-red-500/10 shadow-lg'
                    : isOccupied
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black tracking-tight text-foreground">
                      {table.tableNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {table.seats} ที่
                    </span>
                  </div>
                  {table.zone?.name && (
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {table.zone.name}
                    </span>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-border/50">
                  {isAvailable ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ● ว่าง
                    </span>
                  ) : (
                    <div>
                      <div className="text-xs font-extrabold text-foreground">
                        ฿{activeTotal.toLocaleString()}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isBillReq ? 'text-red-600 animate-pulse' : 'text-amber-600'
                        }`}
                      >
                        {isBillReq ? '🔔 เรียกเช็คบิล' : `${activeOrders.length} ออเดอร์`}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal: Table Details / Open Table / Settle Bill */}
      <Dialog
        open={!!selectedTable && !isCheckoutOpen}
        onOpenChange={() => setSelectedTable(null)}
      >
        <DialogContent className="max-w-md">
          {selectedTable && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <DialogTitle className="text-xl font-black">
                    โต๊ะ {selectedTable.tableNumber}
                  </DialogTitle>
                  <Badge
                    variant={
                      selectedTable.status === TableStatus.AVAILABLE
                        ? 'outline'
                        : selectedTable.status === TableStatus.BILL_REQUESTED
                          ? 'destructive'
                          : 'default'
                    }
                    className={
                      selectedTable.status === TableStatus.OCCUPIED
                        ? 'bg-amber-600 text-white'
                        : ''
                    }
                  >
                    {selectedTable.status === TableStatus.AVAILABLE
                      ? 'โต๊ะว่าง'
                      : selectedTable.status === TableStatus.BILL_REQUESTED
                        ? 'ขอเช็คบิล'
                        : 'กำลังรับประทาน'}
                  </Badge>
                </div>
                {selectedTable.zone?.name && (
                  <CardDescription>
                    โซน: {selectedTable.zone.name} • ความจุ: {selectedTable.seats}{' '}
                    ที่นั่ง
                  </CardDescription>
                )}
              </DialogHeader>

              {/* Case 1: Table is AVAILABLE */}
              {selectedTable.status === TableStatus.AVAILABLE ? (
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
                    className="w-full h-11 font-bold gap-1.5"
                    onClick={() => handleOpenTable(selectedTable)}
                    disabled={isPending}
                  >
                    <IconArmchair className="size-5" />
                    {isPending ? 'กำลังเปิดโต๊ะ...' : 'เปิดโต๊ะ'}
                  </Button>
                </div>
              ) : (
                /* Case 2: Table is OCCUPIED or BILL_REQUESTED */
                <div className="space-y-4 py-2">
                  <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 divide-y border rounded-xl p-3 bg-muted/20">
                    {sessionOrders.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        ยังไม่มีรายการอาหารสั่งในรอบนี้
                      </p>
                    ) : (
                      sessionOrders.map((order: any) => (
                        <div key={order.id} className="pt-2 first:pt-0 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                            <span>#{order.orderNumber}</span>
                            <span>฿{Number(order.totalAmount).toLocaleString()}</span>
                          </div>
                          {order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between text-xs pl-2"
                            >
                              <span>
                                {item.quantity}x {item.title}
                                {item.customerNote && (
                                  <span className="text-[10px] text-amber-600 block">
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

                  {/* Summary */}
                  <div className="p-3 bg-card border rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold">ยอดรวมทั้งสิ้น</span>
                    <span className="text-xl font-black text-primary">
                      ฿{tableBillTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="gap-1.5 font-bold"
                      onClick={() => {
                        if (onSelectTableForOrder) {
                          onSelectTableForOrder(selectedTable)
                        }
                        setSelectedTable(null)
                      }}
                    >
                      <IconPlus className="size-4" />
                      สั่งอาหารเพิ่ม
                    </Button>
                    <Button
                      className="gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setIsCheckoutOpen(true)}
                    >
                      <IconReceipt className="size-4" />
                      เช็คบิล / รับเงิน
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Settle Payment & Close Table */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <IconReceipt className="size-5" />
              ชำระเงินโต๊ะ {selectedTable?.tableNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Grand Total Display */}
            <div className="p-4 bg-primary/10 rounded-2xl text-center">
              <span className="text-xs text-muted-foreground font-semibold">
                ยอดที่ต้องชำระ
              </span>
              <p className="text-3xl font-black text-primary mt-0.5">
                ฿{tableBillTotal.toLocaleString()}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <Label>ช่องทางการชำระเงิน</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 ${
                    paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <IconReceipt className="size-5" />
                  เงินสด (Cash)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(PaymentMethod.MANUAL_QR_PROMPTPAY)
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 ${
                    paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <IconQrcode className="size-5" />
                  สแกน PromptPay
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(PaymentMethod.STRIPE_CREDIT_CARD)
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 ${
                    paymentMethod === PaymentMethod.STRIPE_CREDIT_CARD
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <IconCreditCard className="size-5" />
                  บัตรเครดิต
                </button>
              </div>
            </div>

            {/* Cash Tender Calculation */}
            {paymentMethod === PaymentMethod.CASH_ON_DELIVERY && (
              <div className="space-y-3 p-3 bg-muted/40 rounded-xl border">
                <div className="space-y-1">
                  <Label htmlFor="received" className="text-xs">
                    จำนวนเงินที่รับมา
                  </Label>
                  <Input
                    id="received"
                    type="number"
                    placeholder={`เช่น ${tableBillTotal}`}
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="h-10 text-base font-bold"
                  />
                </div>

                {numReceived > 0 && (
                  <div className="flex items-center justify-between text-sm font-bold pt-1">
                    <span>เงินทอน:</span>
                    <span
                      className={`text-lg font-black ${
                        numReceived >= tableBillTotal
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
                      {numReceived >= tableBillTotal
                        ? `฿${changeAmount.toLocaleString()}`
                        : 'ยอดเงินไม่พอ'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCheckoutOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleSettleBill}
              disabled={
                isPending ||
                (paymentMethod === PaymentMethod.CASH_ON_DELIVERY &&
                  numReceived > 0 &&
                  numReceived < tableBillTotal)
              }
            >
              <IconCheck className="size-4" />
              {isPending ? 'กำลังบันทึก...' : 'ยืนยันรับชำระ & ปิดโต๊ะ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

