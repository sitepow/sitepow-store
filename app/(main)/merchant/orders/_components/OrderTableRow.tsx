'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconCreditCard } from '@tabler/icons-react'

import { GetOrdersItem } from '@/actions/order'
import { UploadSlipDialog } from '@/app/sites/[domain]/user/orders/_components/UploadSlipDialog'
import {
  CurrencyCode,
  OrderStatus,
  PaymentMethod,
} from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { OrderCustomerInfo } from './OrderCustomerInfo'
import { OrderDetailView } from './OrderDetailView'
import { OrderRowActions } from './OrderRowActions'
import { VerifySlipMerchantDialog } from './VerifySlipMerchantDialog'

interface OrderTableRowProps {
  order: GetOrdersItem
  isStripePending: boolean
  onPayWithStripe: (order: GetOrdersItem) => void
}

export function OrderTableRow({
  order,
  isStripePending,
  onPayWithStripe,
}: OrderTableRowProps) {
  const t = useTranslations('merchant.orders')
  const isCancelled = order.status === OrderStatus.CANCELLED

  const isStripePayment =
    order.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
    order.paymentMethod !== PaymentMethod.MANUAL_QR_PROMPTPAY

  return (
    <TableRow
      className={cn(
        'transition-colors',
        isCancelled &&
          'bg-muted/40 text-muted-foreground hover:bg-muted/60 opacity-60',
      )}
    >
      <TableCell
        className={cn(
          'font-medium',
          isCancelled && 'decoration-destructive/60 line-through',
        )}
      >
        #{order.orderNumber}
      </TableCell>

      <TableCell>
        <OrderCustomerInfo order={order} isCancelled={isCancelled} />
      </TableCell>

      <TableCell
        className={cn(
          'max-w-72 min-w-72 wrap-break-word whitespace-pre-line',
          isCancelled && 'line-through',
        )}
      >
        {order.items
          .map((item) => `${item.title} x${item.quantity}`)
          .join(', ')}
      </TableCell>

      <TableCell className={cn(isCancelled && 'line-through')}>
        <div className="flex flex-col">
          <span className="font-semibold">
            {formatCurrency(
              Number(order.totalAmountBase ?? order.totalAmount),
              (order.baseCurrency as CurrencyCode) || CurrencyCode.THB,
            )}
          </span>
          {order.customerCurrency &&
            order.baseCurrency &&
            order.customerCurrency !== order.baseCurrency && (
              <span className="text-muted-foreground text-xs font-normal">
                {formatCurrency(
                  Number(order.totalAmount),
                  order.customerCurrency as CurrencyCode,
                )}
              </span>
            )}
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant={
            isCancelled
              ? 'destructive'
              : (
                    [
                      OrderStatus.PAID,
                      OrderStatus.SHIPPED,
                    ] as OrderStatus[]
                  ).includes(order.status)
                ? 'default'
                : 'outline'
          }
        >
          {t(`statuses.${order.status}` as Parameters<typeof t>[0])}
        </Badge>
      </TableCell>

      <TableCell>{formatDateTime(order.createdAt)}</TableCell>

      <TableCell className="flex items-center justify-end gap-1 text-right">
        {order.status === OrderStatus.PENDING && (
          <>
            {isStripePayment ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isStripePending}
                onClick={() => onPayWithStripe(order)}
              >
                <IconCreditCard className="mr-1 size-4" />
                {isStripePending
                  ? t('connectingStripe')
                  : t('payWithStripe')}
              </Button>
            ) : (
              <UploadSlipDialog
                createdAt={order.createdAt}
                orderId={order.id}
                storeId={order.storeId}
                orderNumber={order.orderNumber}
                customerId={order.customer?.id || ''}
                totalAmount={order.totalAmount}
                bankAccounts={
                  order.bankAccount
                    ? [{ ...order.bankAccount, isDefault: true }]
                    : []
                }
              />
            )}
          </>
        )}
        {order.status === OrderStatus.MANUAL_CHECK && (
          <VerifySlipMerchantDialog order={order} />
        )}
        <OrderDetailView order={order} />
        <OrderRowActions order={order} />
      </TableCell>
    </TableRow>
  )
}
