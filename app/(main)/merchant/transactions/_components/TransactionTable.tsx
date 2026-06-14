'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useTransactions } from '@/actions/hooks/transaction'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { TransactionType } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const POSITIVE_TYPES = ['DEPOSIT', 'REFUND']

export function TransactionTable() {
  const { selectedStoreId } = useStoreFilter()
  const router = useRouter()

  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as TransactionType | null
  const pageParam = Number(searchParams.get('page') ?? 1)

  const { data: { data: transactions = [], meta } = {}, isLoading } =
    useTransactions({
      storeId: selectedStoreId,
      page: pageParam,
      limit: 10,
      type: typeParam ?? undefined,
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
              <TableHead>รหัสธุรกรรม</TableHead>
              <TableHead>รายละเอียดรายการ</TableHead>
              <TableHead>วัน-เวลา ทำรายการ</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && transactions.length === 0 ? (
              <TableLoadingRow colSpan={4} />
            ) : transactions.length === 0 ? (
              <TableEmptyRow colSpan={4} title="ยังไม่มีรายการเงิน" />
            ) : (
              transactions.map((transaction) => {
                const isPositive = POSITIVE_TYPES.includes(transaction.type)

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <div
                          className={`shrink-0 rounded-md border p-1 ${
                            isPositive
                              ? 'border-green-200 bg-green-50 text-green-600'
                              : 'bg-muted border-muted-foreground/10 text-muted-foreground'
                          }`}
                        >
                          {isPositive ? (
                            <IconArrowDownLeft size={14} />
                          ) : (
                            <IconArrowUpRight size={14} />
                          )}
                        </div>
                        <span>{transaction.description ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(new Date(transaction.createdAt))}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        isPositive ? 'text-green-600' : 'text-foreground'
                      }`}
                    >
                      {isPositive
                        ? `+${formatCurrency(Number(transaction.amount))}`
                        : `-${formatCurrency(Number(transaction.amount))}`}
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
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(p))
            router.push(`?${params.toString()}`)
          }}
        />
      )}
    </>
  )
}
