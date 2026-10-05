'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useTransactions } from '@/actions/billing/transaction/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/shared/Pagination'
import { getLabel } from '@/constants/i18n/translate'
import { TransactionType } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import { formatNumber } from '@/utils/formatting/number'
import {
  IconArrowDownLeft,
  IconCpu,
  IconHistory,
  IconReceipt,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

const INCOME_TYPES = [
  TransactionType.CREDIT_PURCHASE,
  TransactionType.REFUND,
] as const

export function CreditHistoryTable() {
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
              <TableHead className="text-right">จำนวนเครดิต</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && transactions.length === 0 ? (
              <TableLoadingRow colSpan={4} />
            ) : transactions.length === 0 ? (
              <TableEmptyRow colSpan={4} title="ยังไม่มีประวัติเครดิต" />
            ) : (
              transactions.map((tx) => {
                const isIncome = (
                  INCOME_TYPES as readonly TransactionType[]
                ).includes(tx.type)

                return (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 rounded-md border border-border/70 bg-muted/20 p-1 text-muted-foreground">
                          {tx.type === TransactionType.AI_USAGE && (
                            <IconCpu size={14} />
                          )}
                          {tx.type === TransactionType.SLIP_VERIFY && (
                            <IconReceipt size={14} />
                          )}
                          {isIncome && <IconArrowDownLeft size={14} className="text-emerald-600 dark:text-emerald-400" />}
                          {!isIncome &&
                            tx.type !== TransactionType.AI_USAGE &&
                            tx.type !== TransactionType.SLIP_VERIFY && (
                              <IconHistory size={14} />
                            )}
                        </div>
                        <span className="font-medium">{getLabel.transactionType(tx.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(new Date(tx.createdAt))}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
                      )}
                    >
                      {isIncome
                        ? `+${formatNumber(tx.amount)}`
                        : `-${formatNumber(tx.amount)}`}
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
