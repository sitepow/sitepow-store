'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { useStoreCheckout } from '@/actions/hooks/checkout'
import { useOrders } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
import { StorePagination } from '@/components/StorePagination'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useOrderSSE } from '@/hooks/use-order-sse'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { OrderTableRow } from './OrderTableRow'

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

  const handlePayWithStripe = (order: GetOrdersItem) => {
    const resellerInfo = (
      order as {
        resellerAgreement?: {
          resellerUser?: { email?: string }
        }
      }
    ).resellerAgreement

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
              orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  isStripePending={storeCheckoutMutation.isPending}
                  onPayWithStripe={handlePayWithStripe}
                />
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
    </div>
  )
}
