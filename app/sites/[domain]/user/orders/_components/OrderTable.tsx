'use client'

import { useState } from 'react'

import { useStorefrontOrders } from '@/actions/hooks/storefront/order'
import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconEye } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
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
import { OrderDetailView } from './OrderDetailView'

interface OrderTableProps {
  search?: string
}

export function OrderTable({ search }: OrderTableProps) {
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] =
    useState<GetStorefrontOrderItemSerialized | null>(null)

  const { data: { data: orders = [], meta } = {}, isLoading } =
    useStorefrontOrders({ page, limit: 10, search })

  const getItemsSummary = (items: GetStorefrontOrderItemSerialized['items']) =>
    items.map((item) => `${item.title} x ${item.quantity}`).join(', ')

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
            {isLoading && orders.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : orders.length === 0 ? (
              <TableEmptyRow colSpan={7} title="ไม่พบประวัติคำสั่งซื้อของคุณ" />
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.orderNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.store.name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {getItemsSummary(order.items)}
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ORDER_STATUS_TH[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {meta && meta.totalPages > 1 && (
        <StorePagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
