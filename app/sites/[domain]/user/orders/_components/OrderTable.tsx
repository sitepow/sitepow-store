'use client'

import { useState } from 'react'

import { useStoreCheckout } from '@/actions/hooks/checkout'
import { useCancelOrder } from '@/actions/hooks/order'
import { useStorefrontOrders } from '@/actions/hooks/storefront/order'
import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconCreditCard, IconX } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { UploadSlipDialog } from './UploadSlipDialog'

interface OrderTableProps {
  search?: string
}

export function OrderTable({ search }: OrderTableProps) {
  const { user } = useSession()
  const [page, setPage] = useState(1)

  const { data: { data: orders = [], meta } = {}, isLoading } =
    useStorefrontOrders({ page, limit: 10, search })

  const storeCheckoutMutation = useStoreCheckout()
  const cancelOrderMutation = useCancelOrder()

  const getItemsSummary = (items: GetStorefrontOrderItemSerialized['items']) =>
    items.map((item) => `${item.title} x ${item.quantity}`).join(', ')

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสสั่งซื้อ</TableHead>
              <TableHead>ร้านค้า / ช่องทาง</TableHead>
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
              orders.map((order) => {
                const isPOSOrder = order.orderNumber?.startsWith('POS-')

                const isStripePayment =
                  order.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
                  order.paymentMethod !== PaymentMethod.MANUAL_QR_PROMPTPAY

                return (
                  <TableRow key={order.id}>
                    <TableCell>#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge>{order.store.name}</Badge>
                        {isPOSOrder && (
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] font-normal"
                          >
                            ซื้อที่หน้าร้าน (POS)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {getItemsSummary(order.items)}
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
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
                      {!isPOSOrder && order.status === OrderStatus.PENDING && (
                        <>
                          {isStripePayment ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={storeCheckoutMutation.isPending}
                              onClick={() => {
                                storeCheckoutMutation.mutate({
                                  customerEmail: user?.email ?? '',
                                  storeId: order.store.id,
                                  orderId: order.id,
                                  description: `ชำระเงินคำสั่งซื้อ #${order.orderNumber}`,
                                  amount: order.totalAmount,
                                  successUrl: `${window.location.origin}/user/orders`,
                                  cancelUrl: `${window.location.origin}/user/orders`,
                                })
                              }}
                            >
                              <IconCreditCard className="mr-1 size-4" />
                              {storeCheckoutMutation.isPending
                                ? 'กำลังเชื่อมต่อ...'
                                : 'ชำระเงินผ่าน Stripe'}
                            </Button>
                          ) : (
                            <UploadSlipDialog
                              createdAt={order.createdAt}
                              orderId={order.id}
                              storeId={order.store.id}
                              orderNumber={order.orderNumber}
                              customerId={order.customerId!}
                              totalAmount={order.totalAmount}
                              bankAccounts={
                                order.bankAccount ? [order.bankAccount] : []
                              }
                            />
                          )}
                        </>
                      )}
                      <OrderDetailView order={order} />
                      {!isPOSOrder &&
                        (
                          [
                            OrderStatus.MANUAL_CHECK,
                            OrderStatus.PENDING,
                          ] as OrderStatus[]
                        ).includes(order.status) && (
                          <DeleteButton
                            icon={<IconX />}
                            isPending={cancelOrderMutation.isPending}
                            onDelete={() =>
                              cancelOrderMutation.mutate(order.id)
                            }
                          />
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
