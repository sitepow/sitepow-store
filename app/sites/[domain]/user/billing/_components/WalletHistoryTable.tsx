import { ComponentProps } from 'react'

import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

import { StorePagination } from '../../../_components/Pagination'

interface WalletTransaction {
  id: string
  type: string
  description: string
  amount: number
  createdAt: string
}

interface WalletHistoryTableProps extends ComponentProps<'div'> {
  history: WalletTransaction[]
}

export function WalletHistoryTable({
  history,
  className,
  ...props
}: WalletHistoryTableProps) {
  return (
    <div className={cn('flex flex-col space-y-5', className)} {...props}>
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
            {history.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`shrink-0 rounded-md border p-1 ${
                        tx.type === 'TOPUP' || tx.type === 'REFUND'
                          ? 'border-green-200 bg-green-50 text-green-600'
                          : 'bg-muted border-muted-foreground/10 text-muted-foreground'
                      }`}
                    >
                      {tx.type === 'TOPUP' || tx.type === 'REFUND' ? (
                        <IconArrowDownLeft size={14} />
                      ) : (
                        <IconArrowUpRight size={14} />
                      )}
                    </div>
                    <span className="text-foreground font-medium">
                      {tx.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{tx.createdAt}</TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    tx.amount > 0 ? 'text-green-600' : 'text-foreground'
                  }`}
                >
                  {tx.amount > 0
                    ? `+฿${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : `-฿${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
    </div>
  )
}
