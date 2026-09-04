'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { MOCK_SMART_STOCK_ITEMS, SmartStockItem } from '@/constants/smart-stock'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconMinus,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'

import { ProductImage } from '@/components/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SmartStockTableProps {
  onMismatchResolved?: () => void
}

export function SmartStockTable({ onMismatchResolved }: SmartStockTableProps) {
  const [items, setItems] = useState<SmartStockItem[]>(MOCK_SMART_STOCK_ITEMS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [isSyncingAll, setIsSyncingAll] = useState(false)

  const [simulationTarget, setSimulationTarget] = useState<{
    item: SmartStockItem
    channel: 'local' | 'shopee' | 'lazada' | 'facebook'
  } | null>(null)
  const [simQty, setSimQty] = useState(1)

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())

    if (!matchSearch) return false

    if (statusFilter === 'MISMATCH') {
      return (
        item.channels.shopee.status === 'MISMATCH' ||
        item.channels.lazada.status === 'MISMATCH' ||
        item.channels.facebook.status === 'MISMATCH'
      )
    }
    if (statusFilter === 'LOW_STOCK') {
      return item.localStock <= item.minStockAlert && item.localStock > 0
    }
    if (statusFilter === 'OUT_OF_STOCK') {
      return item.localStock === 0
    }

    return true
  })

  const handleAdjustLocalStock = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newLocal = Math.max(0, item.localStock + delta)
          return {
            ...item,
            localStock: newLocal,
            totalAvailable: newLocal,
            channels: {
              shopee: {
                ...item.channels.shopee,
                quantity: newLocal,
                status: newLocal === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                lastSyncedAt: 'เมื่อสักครู่',
              },
              lazada: {
                ...item.channels.lazada,
                quantity: newLocal,
                status: newLocal === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                lastSyncedAt: 'เมื่อสักครู่',
              },
              facebook: {
                ...item.channels.facebook,
                quantity: newLocal,
                status: newLocal === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                lastSyncedAt: 'เมื่อสักครู่',
              },
            },
          }
        }
        return item
      }),
    )

    const updated = items.find((i) => i.id === id)
    toast.success(
      `อัปเดตสต็อก ${updated?.sku || ''} เป็น ${Math.max(0, (updated?.localStock || 0) + delta)} ชิ้น`,
    )
  }

  const handleSyncRow = (item: SmartStockItem) => {
    setSyncingId(item.id)
    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === item.id) {
            return {
              ...i,
              channels: {
                shopee: {
                  ...i.channels.shopee,
                  quantity: i.localStock,
                  status: i.localStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                  lastSyncedAt: 'เมื่อสักครู่',
                },
                lazada: {
                  ...i.channels.lazada,
                  quantity: i.localStock,
                  status: i.localStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                  lastSyncedAt: 'เมื่อสักครู่',
                },
                facebook: {
                  ...i.channels.facebook,
                  quantity: i.localStock,
                  status: i.localStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                  lastSyncedAt: 'เมื่อสักครู่',
                },
              },
            }
          }
          return i
        }),
      )
      setSyncingId(null)
      toast.success(`ซิงค์สต็อก ${item.sku} ไปยังทุกแพลตฟอร์มสำเร็จ`)
      onMismatchResolved?.()
    }, 500)
  }

  const handleSyncAll = () => {
    setIsSyncingAll(true)
    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          channels: {
            shopee: {
              ...i.channels.shopee,
              quantity: i.localStock,
              status: i.localStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
              lastSyncedAt: 'เมื่อสักครู่',
            },
            lazada: {
              ...i.channels.lazada,
              quantity: i.localStock,
              status: i.localStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
              lastSyncedAt: 'เมื่อสักครู่',
            },
            facebook: {
              ...i.channels.facebook,
              quantity: i.localStock,
              status: i.localStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
              lastSyncedAt: 'เมื่อสักครู่',
            },
          },
        })),
      )
      setIsSyncingAll(false)
      toast.success('ซิงค์สต็อกสินค้าทุกช่องทางเรียบร้อยแล้ว')
      onMismatchResolved?.()
    }, 800)
  }

  const handleConfirmSimulation = () => {
    if (!simulationTarget) return
    const { item, channel } = simulationTarget
    const qty = simQty

    if (item.localStock < qty) {
      toast.error('สต็อกในคลังมีไม่เพียงพอ')
      return
    }

    const newStock = Math.max(0, item.localStock - qty)

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          return {
            ...i,
            localStock: newStock,
            totalAvailable: newStock,
            channels: {
              shopee: {
                ...i.channels.shopee,
                quantity: newStock,
                status: newStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                lastSyncedAt: 'เมื่อสักครู่',
              },
              lazada: {
                ...i.channels.lazada,
                quantity: newStock,
                status: newStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                lastSyncedAt: 'เมื่อสักครู่',
              },
              facebook: {
                ...i.channels.facebook,
                quantity: newStock,
                status: newStock === 0 ? 'OUT_OF_STOCK' : 'IN_SYNC',
                lastSyncedAt: 'เมื่อสักครู่',
              },
            },
          }
        }
        return i
      }),
    )

    const channelNames = {
      local: 'หน้าร้าน POS',
      shopee: 'Shopee',
      lazada: 'Lazada',
      facebook: 'Facebook Marketplace',
    }

    setSimulationTarget(null)
    toast.success(
      `จำลองขายผ่าน ${channelNames[channel]} จำนวน ${qty} ชิ้นสำเร็จ (สต็อกคงเหลือ ${newStock} ชิ้น)`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-70 flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full sm:w-52">
              <SelectValue placeholder="กรองสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">แสดงสินค้าทั้งหมด</SelectItem>
              <SelectItem value="MISMATCH">
                พบสต็อกไม่ตรงกัน (Mismatch)
              </SelectItem>
              <SelectItem value="LOW_STOCK">สต็อกใกล้หมด</SelectItem>
              <SelectItem value="OUT_OF_STOCK">สินค้าหมด</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isSyncingAll}
          onClick={handleSyncAll}
        >
          {isSyncingAll ? (
            <Spinner className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
          )}
          ซิงค์สต็อกทั้งหมด
        </Button>
      </div>
      <div className="bg-background overflow-x-auto rounded-md border">
        <Table className="min-w-220">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-20 w-16 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                รูปภาพ
              </TableHead>
              <TableHead>สินค้า / SKU</TableHead>
              <TableHead className="text-center">Local (HQ)</TableHead>
              <TableHead className="text-center">Shopee</TableHead>
              <TableHead className="text-center">Lazada</TableHead>
              <TableHead className="text-center">Facebook</TableHead>
              <TableHead className="text-center">สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground h-28 text-center"
                >
                  ไม่พบข้อมูลสินค้าที่ค้นหา
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isSyncing = syncingId === item.id
                const hasMismatch =
                  item.channels.shopee.status === 'MISMATCH' ||
                  item.channels.lazada.status === 'MISMATCH' ||
                  item.channels.facebook.status === 'MISMATCH'

                return (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="bg-background hover:bg-muted/50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <ProductImage
                        alt={item.title}
                        className="size-12 rounded-md"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="leading-snug font-medium">
                          {item.title}
                        </span>
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                          <span>{item.variantTitle}</span>
                          <span>•</span>
                          <span className="">{item.sku}</span>
                          <span>•</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-6 p-0"
                          disabled={item.localStock <= 0}
                          onClick={() => handleAdjustLocalStock(item.id, -1)}
                          title="ลดสต็อก"
                        >
                          <IconMinus size={12} />
                        </Button>
                        <span className="min-w-7 text-center text-sm font-semibold">
                          {formatNumber(item.localStock)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-6 p-0"
                          onClick={() => handleAdjustLocalStock(item.id, +1)}
                          title="เพิ่มสต็อก"
                        >
                          <IconPlus size={12} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">
                        {formatNumber(item.channels.shopee.quantity)}
                      </div>
                      <Badge className="mt-0.5 text-[10px] font-normal">
                        In-Sync
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">
                        {formatNumber(item.channels.lazada.quantity)}
                      </div>
                      {item.channels.lazada.status === 'MISMATCH' ? (
                        <Badge
                          variant="destructive"
                          className="mt-0.5 cursor-pointer text-[10px] font-normal"
                          onClick={() => handleSyncRow(item)}
                          title="กดเพื่อซิงค์ให้ตรงกัน"
                        >
                          ไม่ตรงกัน
                        </Badge>
                      ) : (
                        <Badge className="mt-0.5 text-[10px] font-normal">
                          In-Sync
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">
                        {formatNumber(item.channels.facebook.quantity)}
                      </div>
                      <Badge className="mt-0.5 text-[10px] font-normal">
                        In-Sync
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {hasMismatch ? (
                        <Badge variant="destructive">รอซิงค์</Badge>
                      ) : item.localStock === 0 ? (
                        <Badge variant="destructive">หมด</Badge>
                      ) : (
                        <Badge variant="outline">สมบูรณ์</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSyncing}
                          onClick={() => handleSyncRow(item)}
                          title="ซิงค์สินค้านี้"
                        >
                          {isSyncing ? (
                            <Spinner className="mr-1 h-3.5 w-3.5" />
                          ) : (
                            <IconRefresh size={13} className="mr-1" />
                          )}
                          ซิงค์
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSimulationTarget({ item, channel: 'shopee' })
                            setSimQty(1)
                          }}
                          title="จำลองคำสั่งซื้อ"
                        >
                          <IconPlayerPlay size={13} className="mr-1" />
                          จำลองขาย
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={Boolean(simulationTarget)}
        onOpenChange={(open) => !open && setSimulationTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>จำลองการขายตัดสต็อก</DialogTitle>
            <DialogDescription>
              ทดสอบจำลองคำสั่งซื้อเพื่อดูการตัดสต็อกคลังกลางและซิงค์ไปยังช่องทางอื่นๆ
            </DialogDescription>
          </DialogHeader>

          {simulationTarget && (
            <div className="space-y-3 py-2">
              <div className="bg-muted/30 space-y-1 rounded-md border p-3 text-xs">
                <div className="text-sm font-semibold">
                  {simulationTarget.item.title} (
                  {simulationTarget.item.variantTitle})
                </div>
                <div className="text-muted-foreground">
                  SKU: {simulationTarget.item.sku}
                </div>
                <div>
                  สต็อกปัจจุบัน: {simulationTarget.item.localStock} ชิ้น
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  ช่องทางที่เกิดคำสั่งซื้อ
                </label>
                <Select
                  value={simulationTarget.channel}
                  onValueChange={(val: any) =>
                    setSimulationTarget({ ...simulationTarget, channel: val })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="lazada">Lazada</SelectItem>
                    <SelectItem value="facebook">
                      Facebook Marketplace
                    </SelectItem>
                    <SelectItem value="local">หน้าร้าน POS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  จำนวนที่ขายออก (ชิ้น)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={simulationTarget.item.localStock || 1}
                  value={simQty}
                  onChange={(e) => setSimQty(Number(e.target.value) || 1)}
                  className="h-9"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSimulationTarget(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmSimulation}>ยืนยันการจำลอง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
