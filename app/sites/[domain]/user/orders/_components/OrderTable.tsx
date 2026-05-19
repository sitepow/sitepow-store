'use client'

import { useState } from 'react'

import { IconEye } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { StorePagination } from '../../../_components/Pagination'
import { type BuyerOrder } from '../page'
import { OrderDetailView } from './OrderDetailView'

interface OrderTableProps {
  orders: BuyerOrder[]
}

export function OrderTable({ orders }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFY':
        return <Badge variant="secondary">รอตรวจสอบสลิป</Badge>
      case 'PROCESSING':
        return <Badge variant="secondary">กำลังจัดเตรียม/จัดส่ง</Badge>
      case 'COMPLETED':
        return <Badge>สำเร็จแล้ว</Badge>
      default:
        return <Badge variant="destructive">ยกเลิก</Badge>
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสสั่งซื้อ</TableHead>
              <TableHead>ร้านค้า</TableHead>
              <TableHead>รายการสินค้า</TableHead>
              <TableHead>ยอดสุทธิ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่สั่งซื้อ</TableHead>
              <TableHead className="text-right">ดูข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableEmptyRow colSpan={7} title="ไม่พบประวัติคำสั่งซื้อของคุณ" />
            )}
            {orders?.length !== 0 &&
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.storeName}</TableCell>
                  <TableCell>{order.itemsSummary}</TableCell>
                  <TableCell>฿{order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <IconEye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent>
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
