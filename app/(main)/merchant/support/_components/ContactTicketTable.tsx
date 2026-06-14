'use client'

import { useState } from 'react'

import { useContactTickets } from '@/actions/hooks/contact-ticket'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { TICKET_STATUS_TH } from '@/constants/translate'
import { TicketStatus } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'

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

import { TicketDetailDialog } from './TicketDetailDialog'

const TICKET_STATUS_VARIANT: Record<
  TicketStatus,
  'default' | 'outline' | 'secondary' | 'destructive'
> = {
  [TicketStatus.OPEN]: 'default',
  [TicketStatus.IN_PROGRESS]: 'outline',
  [TicketStatus.RESOLVED]: 'secondary',
  [TicketStatus.CLOSED]: 'secondary',
}

export function ContactTicketTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: tickets = [], meta } = {}, isLoading } =
    useContactTickets({
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
              <TableHead>หัวข้อ</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่แจ้ง</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && tickets.length === 0 ? (
              <TableLoadingRow colSpan={5} />
            ) : tickets.length === 0 ? (
              <TableEmptyRow colSpan={5} title="ยังไม่มี Ticket" />
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="max-w-48 truncate font-medium">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {[ticket.customer.firstName, ticket.customer.lastName]
                          .filter(Boolean)
                          .join(' ') || '-'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {ticket.customer.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TICKET_STATUS_VARIANT[ticket.status]}>
                      {TICKET_STATUS_TH[ticket.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(ticket.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TicketDetailDialog ticket={ticket} />
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
