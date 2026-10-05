'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  IconCheck,
  IconClipboardList,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconPlus,
  IconPrinter,
  IconReceipt,
  IconRotateClockwise,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

import {
  useDeletePurchaseOrder,
  usePurchaseOrders,
} from '@/actions/inventory/procurement/hooks'
import { StatsCard } from '@/app/sites/[domain]/_components/shared/StatsCard'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency } from '@/utils/formatting/number'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
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
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PurchaseOrderData,
  PurchaseOrderDocument,
} from '@/components/procurement/PurchaseOrderDocument'

export function ProcurementTable() {
  const { selectedStoreId } = useStoreFilter()
  const { data: purchaseOrders = [], isLoading } =
    usePurchaseOrders(selectedStoreId)
  const deleteMutation = useDeletePurchaseOrder()
  const { copy } = useCopyToClipboard()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PARTIAL' | 'COMPLETED'>('ALL')
  const [selectedPoForPrint, setSelectedPoForPrint] =
    useState<PurchaseOrderData | null>(null)

  // Calculations for overview cards
  const totalCount = purchaseOrders.length
  const pendingCount = purchaseOrders.filter(
    (p) => p.status === 'PENDING' || p.status === 'PARTIAL',
  ).length
  const completedCount = purchaseOrders.filter(
    (p) => p.status === 'COMPLETED',
  ).length

  const totalEstimatedBudget = purchaseOrders.reduce(
    (sum, p) => sum + Number(p.totalEstimatedAmount || 0),
    0,
  )
  const totalActualSpent = purchaseOrders.reduce(
    (sum, p) => sum + Number(p.totalActualAmount || 0),
    0,
  )

  // Filter items
  const filteredOrders = purchaseOrders.filter((po) => {
    if (filter === 'PENDING' && po.status !== 'PENDING') return false
    if (filter === 'PARTIAL' && po.status !== 'PARTIAL') return false
    if (filter === 'COMPLETED' && po.status !== 'COMPLETED') return false
    if (search) {
      const q = search.toLowerCase()
      const matchNo = po.orderNumber?.toLowerCase().includes(q)
      const matchTitle = po.title?.toLowerCase().includes(q)
      const matchSupplier = po.supplier?.toLowerCase().includes(q)
      const matchBuyer = po.buyerName?.toLowerCase().includes(q)
      return matchNo || matchTitle || matchSupplier || matchBuyer
    }
    return true
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success('ลบใบสั่งซื้อเรียบร้อยแล้ว')
        } else {
          toast.error(res.message || 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/procurement/${id}`
    copy(url)
    toast.success('คัดลอกลิงก์เช็คลิสต์แล้ว')
  }

  const hasActiveFilters = search !== '' || filter !== 'ALL'

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards with standardized StatsCard */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="ใบสั่งซื้อทั้งหมด"
          value={totalCount}
          description="รายการที่สร้างไว้"
          icon={IconClipboardList}
          loading={isLoading}
        />
        <StatsCard
          title="รอดำเนินการ / กำลังซื้อ"
          value={pendingCount}
          description="ยังซื้อไม่ครบทั้งหมด"
          icon={IconClock}
          loading={isLoading}
        />
        <StatsCard
          title="ซื้อครบถ้วนแล้ว"
          value={completedCount}
          description="ซื้อครบทุกรายการแล้ว"
          icon={IconCheck}
          loading={isLoading}
        />
        <StatsCard
          title="งบประมาณที่วางแผน"
          value={formatCurrency(totalEstimatedBudget)}
          description={`ซื้อจริง: ${formatCurrency(totalActualSpent)}`}
          icon={IconReceipt}
          loading={isLoading}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ PO, หัวข้อ, แหล่งซื้อ, ผู้ซื้อ..."
            className="pl-9 h-9 text-xs"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
            >
              <IconX size={14} />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) =>
              setFilter(v as 'ALL' | 'PENDING' | 'PARTIAL' | 'COMPLETED')
            }
          >
            <SelectTrigger className="h-9 w-44 text-xs">
              <SelectValue placeholder="สถานะการซื้อ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">สถานะทั้งหมด ({totalCount})</SelectItem>
              <SelectItem value="PENDING">รอดำเนินการ ({pendingCount})</SelectItem>
              <SelectItem value="PARTIAL">ซื้อแล้วบางส่วน</SelectItem>
              <SelectItem value="COMPLETED">
                ซื้อครบแล้ว ({completedCount})
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter('ALL')
                setSearch('')
              }}
              className="h-9 text-xs"
            >
              <IconRotateClockwise size={14} className="mr-1" />
              ล้างตัวกรอง
            </Button>
          )}

          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 text-xs">
            <Link href="/merchant/store-settings/products">
              <IconPlus size={15} />
              <span>สร้างใบสั่งซื้อจากสินค้า</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่ / วันที่</TableHead>
              <TableHead>หัวข้อ / แหล่งซื้อ</TableHead>
              <TableHead>ผู้จัดซื้อ</TableHead>
              <TableHead className="w-36 text-center">ความคืบหน้า</TableHead>
              <TableHead className="text-right">งบประมาณ (บาท)</TableHead>
              <TableHead className="text-center">สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && purchaseOrders.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : filteredOrders.length === 0 ? (
              <TableEmptyRow
                title="ไม่พบรายการใบสั่งซื้อ"
                description="สามารถไปที่หน้าจัดการสินค้า แล้วเลือกสินค้าที่ต้องการซื้อเพื่อออกใบสั่งซื้อของใหม่ได้ทันที"
                colSpan={7}
              />
            ) : (
              filteredOrders.map((po) => {
                const totalItems = po.items?.length || 0
                const purchasedCount =
                  po.items?.filter((i) => i.isPurchased).length || 0
                const percent =
                  totalItems > 0
                    ? Math.round((purchasedCount / totalItems) * 100)
                    : 0

                return (
                  <TableRow key={po.id}>
                    {/* PO Number & Date */}
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold text-foreground block text-xs">
                        {po.orderNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(po.createdAt)}
                      </span>
                      {po.targetDate && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                          นัดซื้อ: {formatDateTime(po.targetDate)}
                        </span>
                      )}
                    </TableCell>

                    {/* Title & Supplier */}
                    <TableCell className="max-w-64 min-w-48 wrap-break-word">
                      <span className="font-medium text-foreground block text-sm leading-snug">
                        {po.title || 'รายการสั่งซื้อสินค้า'}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        แหล่งซื้อ: {po.supplier || 'ร้านค้าทั่วไป'}
                      </span>
                      {po.note && (
                        <span className="text-[11px] text-muted-foreground italic truncate block max-w-xs">
                          โน้ต: {po.note}
                        </span>
                      )}
                    </TableCell>

                    {/* Buyer */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {po.buyerName || 'พนักงานจัดซื้อ'}
                    </TableCell>

                    {/* Progress */}
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="space-y-1.5 w-28 mx-auto">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground font-mono">
                            {purchasedCount}/{totalItems}
                          </span>
                          <span className="font-semibold text-primary">
                            {percent}%
                          </span>
                        </div>
                        <Progress value={percent} className="h-1.5" />
                      </div>
                    </TableCell>

                    {/* Amounts */}
                    <TableCell className="text-right whitespace-nowrap">
                      <span className="font-medium text-foreground block text-sm">
                        {formatCurrency(Number(po.totalEstimatedAmount))}
                      </span>
                      {Number(po.totalActualAmount) > 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
                          ซื้อจริง: {formatCurrency(Number(po.totalActualAmount))}
                        </span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge
                        variant={
                          po.status === 'COMPLETED'
                            ? 'default'
                            : po.status === 'PARTIAL'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="font-normal"
                      >
                        {po.status === 'COMPLETED'
                          ? 'ซื้อครบแล้ว'
                          : po.status === 'PARTIAL'
                            ? 'ซื้อแล้วบางส่วน'
                            : 'รอดำเนินการ'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                      {/* Open Web Checklist Link */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        title="เปิดดูเช็คลิสต์บนมือถือ/เว็บ"
                      >
                        <Link href={`/procurement/${po.id}`} target="_blank">
                          <IconExternalLink size={15} />
                          <span className="hidden sm:inline">เช็คลิสต์</span>
                        </Link>
                      </Button>

                      {/* Print Document Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedPoForPrint(po as unknown as PurchaseOrderData)
                        }
                        title="พิมพ์ใบสั่งซื้อพร้อม QR Code"
                      >
                        <IconPrinter size={15} />
                        <span className="hidden sm:inline">พิมพ์</span>
                      </Button>

                      {/* Copy Shareable Link */}
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => handleCopyLink(po.id)}
                        title="คัดลอกลิงก์แชร์"
                      >
                        <IconCopy size={16} />
                      </Button>

                      {/* Delete PO Button with standard DeleteButton */}
                      <DeleteButton
                        isPending={deleteMutation.isPending}
                        title={`ยืนยันการลบใบสั่งซื้อ #${po.orderNumber}?`}
                        description="การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลใบสั่งซื้อจะถูกลบออกจากระบบอย่างถาวร"
                        onDelete={() => handleDelete(po.id)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Print Document Modal */}
      {selectedPoForPrint && (
        <Dialog
          open={!!selectedPoForPrint}
          onOpenChange={(v) => {
            if (!v) setSelectedPoForPrint(null)
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>
                    ใบสั่งซื้อสินค้า #{selectedPoForPrint.orderNumber}
                  </DialogTitle>
                  <DialogDescription>
                    พิมพ์หรือดาวน์โหลดเอกสารใบสั่งซื้อสินค้า
                  </DialogDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <IconPrinter size={16} />
                  <span>สั่งพิมพ์</span>
                </Button>
              </div>
            </DialogHeader>

            <div className="flex justify-center items-start overflow-y-auto rounded-md border bg-muted/30 p-4">
              <div
                id="printable-document"
                className="bg-white text-neutral-900 shadow-md rounded-sm w-[210mm] min-h-[297mm]"
              >
                <PurchaseOrderDocument po={selectedPoForPrint} />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedPoForPrint(null)}
              >
                ปิดหน้าต่าง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
