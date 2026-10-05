'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  IconCheck,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconHistory,
  IconPlus,
  IconPrinter,
  IconSearch,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import {
  useDeletePurchaseOrder,
  usePurchaseOrders,
} from '@/actions/inventory/procurement/hooks'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
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
  const { copied, copy } = useCopyToClipboard()

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

  const handleDelete = (id: string, poNumber: string) => {
    if (confirm(`คุณต้องการลบใบสั่งซื้อ #${poNumber} ใช่หรือไม่?`)) {
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
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/procurement/${id}`
    copy(url)
    toast.success('คัดลอกลิงก์เช็คลิสต์แล้ว')
  }

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              ใบสั่งซื้อทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              รายการที่สร้างไว้
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-amber-600">
              รอดำเนินการ / กำลังซื้อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ยังซื้อไม่ครบทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-600">
              ซื้อครบถ้วนแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {completedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ซื้อครบทุกรายการแล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              งบประมาณที่วางแผน / ใช้จริง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {formatCurrency(totalEstimatedBudget)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium truncate mt-0.5">
              ซื้อจริง: {formatCurrency(totalActualSpent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ PO, หัวข้อ, แหล่งซื้อ, ผู้ซื้อ..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-muted/60 p-1 rounded-lg border text-xs">
            <Button
              type="button"
              variant={filter === 'ALL' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter('ALL')}
            >
              ทั้งหมด ({totalCount})
            </Button>
            <Button
              type="button"
              variant={filter === 'PENDING' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter('PENDING')}
            >
              รอดำเนินการ
            </Button>
            <Button
              type="button"
              variant={filter === 'COMPLETED' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter('COMPLETED')}
            >
              ซื้อครบแล้ว ({completedCount})
            </Button>
          </div>

          <Button asChild size="sm" className="h-9 gap-1.5 text-xs">
            <Link href="/merchant/store-settings/products">
              <IconPlus size={15} />
              <span>สร้างใบสั่งซื้อจากสินค้า</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-md border bg-white shadow-2xs">
        <Table className="min-w-225">
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
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs">
                  <Spinner className="size-5 mx-auto text-primary mb-2" />
                  กำลังโหลดข้อมูลใบสั่งซื้อ...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="space-y-2">
                    <IconShoppingCart className="size-10 mx-auto text-neutral-300" />
                    <p className="font-semibold text-neutral-800 text-sm">
                      ไม่พบรายการใบสั่งซื้อ
                    </p>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      สามารถไปที่หน้าจัดการสินค้า แล้วติ๊กเลือกสินค้าที่ต้องการซื้อเพื่อออกใบสั่งซื้อของใหม่ได้ทันที
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                      <Link href="/merchant/store-settings/products">
                        ไปที่หน้าสินค้าเพื่อเลือกซื้อ
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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
                  <TableRow key={po.id} className="hover:bg-muted/50 transition-colors">
                    {/* PO Number & Date */}
                    <TableCell>
                      <span className="font-bold text-neutral-900 block font-mono text-xs">
                        {po.orderNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(po.createdAt)}
                      </span>
                      {po.targetDate && (
                        <span className="text-[10px] text-amber-700 block font-medium">
                          นัดซื้อ: {formatDateTime(po.targetDate)}
                        </span>
                      )}
                    </TableCell>

                    {/* Title & Supplier */}
                    <TableCell className="max-w-64 min-w-48 wrap-break-word">
                      <span className="font-semibold text-neutral-900 block text-xs">
                        {po.title || 'รายการสั่งซื้อสินค้า'}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        แหล่งซื้อ: <strong>{po.supplier || 'ร้านค้าทั่วไป'}</strong>
                      </span>
                      {po.note && (
                        <span className="text-[10px] text-neutral-500 italic truncate block max-w-xs">
                          โน้ต: {po.note}
                        </span>
                      )}
                    </TableCell>

                    {/* Buyer */}
                    <TableCell className="text-xs text-neutral-700">
                      {po.buyerName || 'พนักงานจัดซื้อ'}
                    </TableCell>

                    {/* Progress */}
                    <TableCell className="text-center">
                      <div className="space-y-1.5 w-28 mx-auto">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-medium text-neutral-700">
                            {purchasedCount}/{totalItems}
                          </span>
                          <span className="font-bold text-primary">
                            {percent}%
                          </span>
                        </div>
                        <Progress value={percent} className="h-1.5 bg-neutral-100" />
                      </div>
                    </TableCell>

                    {/* Amounts */}
                    <TableCell className="text-right">
                      <span className="font-bold text-neutral-900 block text-xs">
                        {formatCurrency(Number(po.totalEstimatedAmount))}
                      </span>
                      {Number(po.totalActualAmount) > 0 && (
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          ซื้อจริง: {formatCurrency(Number(po.totalActualAmount))}
                        </span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          po.status === 'COMPLETED'
                            ? 'default'
                            : po.status === 'PARTIAL'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-[10px] font-normal"
                      >
                        {po.status === 'COMPLETED'
                          ? 'ซื้อครบแล้ว'
                          : po.status === 'PARTIAL'
                            ? 'ซื้อแล้วบางส่วน'
                            : 'รอดำเนินการ'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right space-x-1.5">
                      {/* Open Web Checklist Link */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1"
                        title="เปิดดูเช็คลิสต์บนมือถือ/เว็บ"
                      >
                        <Link href={`/procurement/${po.id}`} target="_blank">
                          <IconExternalLink size={14} />
                          <span className="hidden sm:inline">เปิดเช็คลิสต์</span>
                        </Link>
                      </Button>

                      {/* Print Document Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1"
                        onClick={() =>
                          setSelectedPoForPrint(po as unknown as PurchaseOrderData)
                        }
                        title="พิมพ์ใบสั่งซื้อพร้อม QR Code"
                      >
                        <IconPrinter size={14} />
                        <span className="hidden sm:inline">พิมพ์</span>
                      </Button>

                      {/* Copy Shareable Link */}
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="size-8 text-neutral-500 hover:text-neutral-900"
                        onClick={() => handleCopyLink(po.id)}
                        title="คัดลอกลิงก์แชร์"
                      >
                        <IconCopy size={15} />
                      </Button>

                      {/* Delete PO Button */}
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="size-8 text-neutral-400 hover:text-rose-600"
                        onClick={() => handleDelete(po.id, po.orderNumber)}
                        disabled={deleteMutation.isPending}
                        title="ลบใบสั่งซื้อนี้"
                      >
                        <IconTrash size={15} />
                      </Button>
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
          onOpenChange={() => setSelectedPoForPrint(null)}
        >
          <DialogContent className="max-w-4xl! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b flex items-center justify-between bg-neutral-50">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <IconPrinter className="size-5 text-primary" />
                พิมพ์ใบสั่งซื้อสินค้า #{selectedPoForPrint.orderNumber}
              </DialogTitle>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-neutral-900 text-white hover:bg-neutral-800 gap-1.5 h-8 text-xs"
              >
                <IconPrinter size={15} />
                <span>สั่งพิมพ์ (Print)</span>
              </Button>
            </div>

            <div className="flex-1 bg-neutral-200/70 p-6 overflow-y-auto flex justify-center items-start">
              <div
                id="printable-document"
                className="bg-white shadow-xl rounded-sm w-[210mm] min-h-[297mm]"
              >
                <PurchaseOrderDocument po={selectedPoForPrint} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
