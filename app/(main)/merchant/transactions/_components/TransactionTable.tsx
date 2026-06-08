'use client'

import { useState } from 'react'

import { useTransactions } from '@/actions/hooks/transaction'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { TRANSACTION_TYPE_TH } from '@/constants/translate'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function TransactionTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: transactions = [], meta } = {}, isLoading } =
    useTransactions({
      storeId: selectedStoreId,
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
              <TableHead>ประเภท</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead>เลขออเดอร์</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && transactions.length === 0 ? (
              <TableLoadingRow colSpan={4} />
            ) : transactions.length === 0 ? (
              <TableEmptyRow colSpan={4} title="ยังไม่มีรายการเงิน" />
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {TRANSACTION_TYPE_TH[transaction.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {transaction.description ?? '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {transaction.orderId ?? '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(transaction.amount))}
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
