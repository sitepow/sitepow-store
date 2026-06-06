'use client'

import { useState } from 'react'

import { useTransactions } from '@/actions/hooks/subscription'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/config/planDetails'
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

  const { data: { data: transactions = [], meta } = {}, isLoading } =
    useTransactions({
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
              <TableHead>รหัสธุรกรรม</TableHead>
              <TableHead>สำหรับร้านค้า</TableHead>
              <TableHead>แพลน</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>ยอด</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && transactions.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : transactions.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                title="ไม่พบประวัติการชำระเงินของร้านค้าที่คุณเลือก"
              />
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <span className="text-xs font-medium">{tx.id}</span>
                  </TableCell>
                  <TableCell>
                    <span>{tx.store.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {PLAN_DETAILS[tx.store.plan].name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(tx.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{tx.description ?? tx.type}</Badge>
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
