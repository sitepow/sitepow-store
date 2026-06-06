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

interface PointTransaction {
  id: string
  type: string
  description: string
  storeName: string
  points: number
  createdAt: string
}

interface RewardsHistoryTableProps extends ComponentProps<'div'> {
  history: PointTransaction[]
}

export function RewardsHistoryTable({
  history,
  className,
  ...props
}: RewardsHistoryTableProps) {
  return (
    <div className={cn('flex flex-col space-y-5', className)} {...props}>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รายละเอียดกิจกรรม</TableHead>
              <TableHead>ร้านค้า / แบรนด์</TableHead>
              <TableHead>วัน-เวลา ทำรายการ</TableHead>
              <TableHead className="text-right">จำนวนคะแนน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`shrink-0 rounded-md border p-1 ${
                        tx.type === 'EARN'
                          ? 'border-green-200 bg-green-50 text-green-600'
                          : 'border-red-200 bg-red-50 text-red-500'
                      }`}
                    >
                      {tx.type === 'EARN' ? (
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
                <TableCell className="text-muted-foreground font-medium">
                  {tx.storeName}
                </TableCell>
                <TableCell>{tx.createdAt}</TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    tx.type === 'EARN' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points}` : `${tx.points}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* <StorePagination /> */}
    </div>
  )
}
