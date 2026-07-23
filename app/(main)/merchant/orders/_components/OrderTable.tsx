import { useState } from 'react'

import { useOrders } from '@/actions/hooks/order'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { User2 } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { OrderDetailDialog } from './OrderDetailDialog'
import { VerifySlipMerchantDialog } from './VerifySlipMerchantDialog'

export function OrderTable() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const [page, setPage] = useState(1)

  const { data: { data: orders = [], meta } = {}, isLoading } = useOrders({
    storeId: selectedStoreId,
    branchId: selectedBranchId,
    page,
    limit: 10,
  })

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสออเดอร์</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>รายการสินค้า</TableHead>
              <TableHead>ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && orders.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : orders.length === 0 ? (
              <TableEmptyRow colSpan={7} title="ยังไม่มีออเดอร์" />
            ) : (
              orders.map((order) => {
                const customerName = order.customer
                  ? [order.customer.firstName, order.customer.lastName]
                      .filter(Boolean)
                      .join(' ')
                  : '-'

                return (
                  <TableRow key={order.id}>
                    <TableCell>#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="size-8 border">
                          <AvatarFallback>
                            <User2 size={16} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 max-w-72 space-y-1 wrap-break-word whitespace-pre-line">
                          <p className="text-sm leading-none font-medium">
                            {customerName || 'ลูกค้า'}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {order.customer?.email ?? '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {order.items
                        .map((item) => `${item.title} x${item.quantity}`)
                        .join(', ')}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(order.totalAmount))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (
                            [
                              OrderStatus.PAID,
                              OrderStatus.SHIPPED,
                            ] as OrderStatus[]
                          ).includes(order.status)
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {ORDER_STATUS_TH[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell className="flex items-center justify-end gap-2.5 text-right">
                      <OrderDetailDialog order={order} />
                      {order.status === OrderStatus.MANUAL_CHECK && (
                        <VerifySlipMerchantDialog order={order} />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
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
    </>
  )
}
