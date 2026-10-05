'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  IconCheck,
  IconClock,
  IconExternalLink,
  IconHistory,
  IconPrinter,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import {
  useDeletePurchaseOrder,
  usePurchaseOrders,
} from '@/actions/inventory/procurement/hooks'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency } from '@/utils/formatting/number'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  PurchaseOrderData,
  PurchaseOrderDocument,
} from './PurchaseOrderDocument'

interface PurchaseOrderHistoryDialogProps {
  storeId: string
  trigger?: React.ReactNode
}

export function PurchaseOrderHistoryDialog({
  storeId,
  trigger,
}: PurchaseOrderHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders(storeId)
  const deleteMutation = useDeletePurchaseOrder()

  const [selectedPoForPrint, setSelectedPoForPrint] =
    useState<PurchaseOrderData | null>(null)

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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9"
            >
              <IconHistory size={16} />
              <span>ประวัติใบสั่งซื้อ ({purchaseOrders.length})</span>
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-4xl! w-[92vw] max-h-[85vh] p-0 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/40">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <IconHistory className="size-5 text-primary" />
                ประวัติใบสั่งซื้อสินค้า / รายการซื้อของ (Purchase Orders)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                ดูประวัติ ตรวจสอบสถานะการซื้อ และสั่งพิมพ์ใบสั่งซื้อย้อนหลัง
              </DialogDescription>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-xs">
                <Spinner className="size-6 text-primary mb-2" />
                <p>กำลังโหลดประวัติใบสั่งซื้อ...</p>
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground space-y-2">
                <IconShoppingCart className="size-12 mx-auto text-muted-foreground/40" />
                <p className="font-semibold text-foreground text-sm">
                  ยังไม่มีประวัติใบสั่งซื้อ
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  คุณสามารถติ๊กเลือกสินค้าในตารางเพื่อออกใบสั่งซื้อของใหม่ได้ทันที
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground font-semibold border-b">
                      <th className="py-2.5 px-3 text-left">เลขที่ / วันที่</th>
                      <th className="py-2.5 px-3 text-left">หัวข้อ / แหล่งซื้อ</th>
                      <th className="py-2.5 px-2 text-center">ความคืบหน้า</th>
                      <th className="py-2.5 px-3 text-right">งบประมาณ</th>
                      <th className="py-2.5 px-2 text-center">สถานะ</th>
                      <th className="py-2.5 px-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => {
                      const totalItems = po.items?.length || 0
                      const purchasedCount =
                        po.items?.filter((i) => i.isPurchased).length || 0
                      const percent =
                        totalItems > 0
                          ? Math.round((purchasedCount / totalItems) * 100)
                          : 0

                      return (
                        <tr
                          key={po.id}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <span className="font-bold text-foreground block ">
                              {po.orderNumber}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDateTime(po.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-foreground block">
                              {po.title || 'รายการสั่งซื้อสินค้า'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              แหล่งซื้อ: {po.supplier || 'ร้านค้าทั่วไป'}
                              {po.buyerName ? ` | ผู้ซื้อ: ${po.buyerName}` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-semibold text-foreground block text-[11px]">
                              {purchasedCount}/{totalItems} รายการ
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({percent}%)
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-bold text-foreground block">
                              {formatCurrency(Number(po.totalEstimatedAmount))}
                            </span>
                            {Number(po.totalActualAmount) > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                                ซื้อจริง: {formatCurrency(Number(po.totalActualAmount))}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
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
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              title="เปิดดูเช็คลิสต์บนเว็บ"
                            >
                              <Link
                                href={`/procurement/${po.id}`}
                                target="_blank"
                              >
                                <IconExternalLink size={13} className="mr-1" />
                                เช็คลิสต์
                              </Link>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                setSelectedPoForPrint(
                                  po as unknown as PurchaseOrderData,
                                )
                              }
                              title="พิมพ์ใบสั่งซื้อ"
                            >
                              <IconPrinter size={13} className="mr-1" />
                              พิมพ์
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-1.5 text-muted-foreground/60 hover:text-destructive"
                              onClick={() => handleDelete(po.id, po.orderNumber)}
                              disabled={deleteMutation.isPending}
                              title="ลบใบสั่งซื้อ"
                            >
                              <IconTrash size={14} />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPoForPrint && (
        <Dialog
          open={!!selectedPoForPrint}
          onOpenChange={() => setSelectedPoForPrint(null)}
        >
          <DialogContent className="max-w-4xl! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/40">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <IconPrinter className="size-5 text-primary" />
                พิมพ์ใบสั่งซื้อสินค้า #{selectedPoForPrint.orderNumber}
              </DialogTitle>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 h-8 text-xs"
              >
                <IconPrinter size={15} />
                <span>สั่งพิมพ์ (Print)</span>
              </Button>
            </div>

            <div className="flex-1 bg-muted/30 p-6 overflow-y-auto flex justify-center items-start">
              <div
                id="printable-document"
                className="bg-white text-neutral-900 shadow-xl rounded-sm w-[210mm] min-h-[297mm]"
              >
                <PurchaseOrderDocument po={selectedPoForPrint} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

