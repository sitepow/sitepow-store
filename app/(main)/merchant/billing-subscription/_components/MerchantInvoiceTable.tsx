'use client'

import { useState } from 'react'

import { useSubscriptionInvoices } from '@/actions/hooks/subscription'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/constants/plan'
import { InvoiceStatus } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconDownload } from '@tabler/icons-react'

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

  const { data: { data: invoices = [], meta } = {}, isLoading } =
    useSubscriptionInvoices({
      ownerId: user?.id ?? '',
      storeId: selectedStoreId === ALL_STORES ? undefined : selectedStoreId,
      page,
      limit: 10,
    })

  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสใบแจ้งหนี้</TableHead>
              <TableHead>สำหรับร้านค้า</TableHead>
              <TableHead>แพลน</TableHead>
              <TableHead>รอบบริการ</TableHead>
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
                  <TableCell>{inv.store.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PLAN_DETAILS[inv.plan].name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(inv.periodStart)} –{' '}
                      {formatDate(inv.periodEnd)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(inv.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === InvoiceStatus.PAID
                          ? 'default'
                          : inv.status === InvoiceStatus.FAILED
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {inv.status === InvoiceStatus.PAID
                        ? 'ชำระแล้ว'
                        : inv.status === InvoiceStatus.FAILED
                          ? 'ล้มเหลว'
                          : 'รอชำระ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon">
                      <IconDownload />
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
    </>
  )
}
