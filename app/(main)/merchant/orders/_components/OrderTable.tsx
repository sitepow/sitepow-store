'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useStoreCheckout } from '@/actions/hooks/checkout'
import { useOrders } from '@/actions/hooks/order'
import { StorePagination } from '@/components/StorePagination'
import { UploadSlipDialog } from '@/app/sites/[domain]/user/orders/_components/UploadSlipDialog'
import { ORDER_STATUS_TH } from '@/constants/translate'
import {
  CurrencyCode,
  OrderStatus,
  PaymentMethod,
} from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useOrderSSE } from '@/hooks/use-order-sse'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import {
  IconCreditCard,
  IconDotsVertical,
  IconFileDescription,
  IconFileInvoice,
  IconPackageExport,
  IconPrinter,
  IconReceipt,
} from '@tabler/icons-react'
import { Store, User2 } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

import { OrderDetailView } from './OrderDetailView'
import { VerifySlipMerchantDialog } from './VerifySlipMerchantDialog'

function OrderRowActions({ order }: { order: any }) {
  const t = useTranslations('merchant.orders')

  const handleDownloadDoc = (docType: string) => {
    window.open(`/merchant/orders/${order.id}/print?type=${docType}`, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <IconDotsVertical size={18} />
          <span className="sr-only">{t('openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('orderDocuments')}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleDownloadDoc('receipt')}>
            <IconReceipt size={16} />
            <span>{t('receiptA4')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('receipt-slip')}>
            <IconReceipt size={16} />
            <span>{t('receiptSlip')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('tax-invoice')}>
            <IconFileInvoice size={16} />
            <span>{t('taxInvoice')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('delivery-note')}>
            <IconPackageExport size={16} />
            <span>{t('deliveryNote')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('shipping-label')}>
            <IconPrinter size={16} />
            <span>{t('shippingLabel')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('packing-slip')}>
            <IconFileDescription size={16} />
            <span>{t('packingSlip')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function OrderTable() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.orders')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const [page, setPage] = useState(1)

  useOrderSSE(selectedStoreId)

  const { data: { data: orders = [], meta } = {}, isLoading } = useOrders({
    storeId: selectedStoreId,
    branchId: selectedBranchId,
    page,
    limit: 10,
  })

  const storeCheckoutMutation = useStoreCheckout()

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <div
      className="space-y-4"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.orderId')}</TableHead>
              <TableHead>{t('columns.customer')}</TableHead>
              <TableHead>{t('columns.items')}</TableHead>
              <TableHead>{t('columns.total')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.createdAt')}</TableHead>
              <TableHead className="text-right">
                {t('columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && orders.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : orders.length === 0 ? (
              <TableEmptyRow colSpan={7} title={t('noOrders')} />
            ) : (
              orders.map((order) => {
                const isCancelled = order.status === OrderStatus.CANCELLED

                const isResellerPOS =
                  order.orderNumber?.startsWith('RS-POS-') ||
                  Boolean(
                    (order as { resellerAgreementId?: string })
                      .resellerAgreementId,
                  )

                const isPOSOrder =
                  !isResellerPOS &&
                  (order.orderNumber?.startsWith('POS-') ||
                    (order as { isPOS?: boolean }).isPOS)

                const registeredCustomerName = order.customer
                  ? [order.customer.firstName, order.customer.lastName]
                      .filter(Boolean)
                      .join(' ')
                  : null

                const employeeName = (
                  order as {
                    employee?: { firstName?: string; lastName?: string }
                  }
                ).employee
                  ? [
                      (order as { employee?: { firstName?: string } }).employee
                        ?.firstName,
                      (order as { employee?: { lastName?: string } }).employee
                        ?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ')
                  : null

                const resellerInfo = (
                  order as {
                    resellerAgreement?: {
                      resellerStore?: { name?: string }
                      resellerUser?: { name?: string; email?: string }
                    }
                  }
                ).resellerAgreement

                let displayName = registeredCustomerName
                let displaySubtext = order.customer?.email || null

                if (isResellerPOS) {
                  displayName =
                    resellerInfo?.resellerStore?.name ||
                    resellerInfo?.resellerUser?.name ||
                    resellerInfo?.resellerUser?.email ||
                    t('resellerFallback')
                  displaySubtext = t('resellerPosSubtext')
                } else if (isPOSOrder) {
                  if (!displayName) {
                    displayName = t('walkInCustomer')
                  }
                  if (employeeName) {
                    displaySubtext = t('staffPrefix', { name: employeeName })
                  } else if (!displaySubtext) {
                    displaySubtext = ''
                  }
                } else {
                  if (!displayName) {
                    displayName = t('guestCustomer')
                  }
                  if (!displaySubtext) {
                    displaySubtext = '-'
                  }
                }

                const isStripePayment =
                  order.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
                  order.paymentMethod !== PaymentMethod.MANUAL_QR_PROMPTPAY

                return (
                  <TableRow
                    key={order.id}
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
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={cn(
                            'size-8 border',
                            isCancelled && 'opacity-60 grayscale',
                          )}
                        >
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {isResellerPOS ? (
                              <Store size={15} />
                            ) : isPOSOrder && !registeredCustomerName ? (
                              <Store size={15} />
                            ) : (
                              <User2 size={15} />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-64 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p
                              className={cn(
                                'text-sm leading-none font-medium',
                                isCancelled && 'line-through',
                              )}
                            >
                              {displayName}
                            </p>
                            {isResellerPOS ? (
                              <Badge className="px-1.5 py-0 text-[10px] font-normal">
                                {t('resellerBadge')}
                              </Badge>
                            ) : isPOSOrder ? (
                              <Badge className="px-1.5 py-0 text-[10px] font-normal">
                                POS
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {displaySubtext}
                          </p>
                        </div>
                      </div>
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
                            (order.baseCurrency as any) || CurrencyCode.THB,
                          )}
                        </span>
                        {order.customerCurrency &&
                          order.baseCurrency &&
                          order.customerCurrency !== order.baseCurrency && (
                            <span className="text-muted-foreground text-xs font-normal">
                              {formatCurrency(
                                Number(order.totalAmount),
                                order.customerCurrency as any,
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
                        {t(`statuses.${order.status}` as any)}
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
                              disabled={storeCheckoutMutation.isPending}
                              onClick={() => {
                                storeCheckoutMutation.mutate({
                                  customerEmail:
                                    order.customer?.email ||
                                    resellerInfo?.resellerUser?.email ||
                                    'guest@checkout.local',
                                  storeId: order.storeId,
                                  orderId: order.id,
                                  description: t('stripePaymentDesc', {
                                    orderNumber: order.orderNumber,
                                  }),
                                  amount: Number(order.totalAmount),
                                  currency: order.customerCurrency || 'THB',
                                  successUrl: `${window.location.origin}/merchant/orders`,
                                  cancelUrl: `${window.location.origin}/merchant/orders`,
                                })
                              }}
                            >
                              <IconCreditCard className="mr-1 size-4" />
                              {storeCheckoutMutation.isPending
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
    </div>
  )
}
