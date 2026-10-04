'use client'

import { useState } from 'react'

import { useCheckout } from '@/actions/billing/checkout/hooks'
import { useSubscriptionInvoices } from '@/actions/billing/subscription/hooks'
import { GetSubscriptionInvoiceItemSerialized } from '@/actions/billing/subscription/actions'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/constants/billing/plan'
import { getLabel } from '@/constants/i18n/translate'
import { InvoiceStatus } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { CheckoutType } from '@/types/checkout'
import { formatDate } from '@/utils/formatting/date'
import { formatCurrency } from '@/utils/formatting/number'
import { IconArrowRight, IconDownload } from '@tabler/icons-react'

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

export function MerchantInvoiceTable() {
  const { user } = useSession()
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { mutate: checkout, isPending } = useCheckout()

  const { data: { data: invoices = [], meta } = {}, isLoading } =
    useSubscriptionInvoices({
      ownerId: user?.id ?? '',
      storeId: selectedStoreId === ALL_STORES ? undefined : selectedStoreId,
      page,
      limit: 10,
    })

  const handleCheckout = (inv: GetSubscriptionInvoiceItemSerialized) => {
    checkout({
      customerEmail: user?.email ?? '',
      amount: Number(inv.amount),
      description: inv.description!,
      successUrl: `${window.location.origin}/merchant/billing-subscription`,
      cancelUrl: `${window.location.origin}/merchant/billing-subscription`,
      metadata: {
        type: CheckoutType.SUBSCRIPTION,
        relatedId: inv.id,
        storeId: inv.store.id,
      },
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสใบแจ้งหนี้</TableHead>
              <TableHead>แพลน</TableHead>
              <TableHead>รอบบริการ</TableHead>
              <TableHead>สิทธิ์การใช้งาน</TableHead>
              <TableHead>ยอด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && invoices.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : invoices.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                title="ไม่พบประวัติใบแจ้งหนี้ของร้านค้าที่คุณเลือก"
              />
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PLAN_DETAILS[inv.plan].name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(inv.periodStart)} –{' '}
                      {formatDate(inv.periodEnd)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {PLAN_DETAILS[inv.plan].features.join(', ')}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(inv.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === InvoiceStatus.FAILED
                          ? 'destructive'
                          : inv.status === InvoiceStatus.PAID
                            ? 'default'
                            : 'outline'
                      }
                    >
                      {getLabel.invoiceStatus(inv.status)}
                    </Badge>
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    {inv.status === InvoiceStatus.UNPAID ? (
                      <Button
                        size="sm"
                        onClick={() => handleCheckout(inv)}
                        disabled={isPending}
                      >
                        {isPending ? 'กำลังไปยังหน้าชำระเงิน...' : 'ชำระเงิน'}
                        <IconArrowRight />
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon">
                        <IconDownload className="size-4" />
                      </Button>
                    )}
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
    </>
  )
}
