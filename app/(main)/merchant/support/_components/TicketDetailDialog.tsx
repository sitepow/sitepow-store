'use client'

import { useState } from 'react'

import { GetContactTicketsItem } from '@/actions/contact-ticket'
import { useUpdateTicketStatus } from '@/actions/hooks/contact-ticket'
import { TICKET_STATUS_TH } from '@/constants/translate'
import { TicketStatus } from '@/generated/prisma/enums'
import { formatDate } from '@/utils/date'
import { IconEye } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const TICKET_STATUS_VARIANT: Record<
  TicketStatus,
  'default' | 'outline' | 'secondary' | 'destructive'
> = {
  [TicketStatus.OPEN]: 'default',
  [TicketStatus.IN_PROGRESS]: 'outline',
  [TicketStatus.RESOLVED]: 'secondary',
  [TicketStatus.CLOSED]: 'secondary',
}

interface TicketDetailDialogProps {
  ticket: GetContactTicketsItem
}

export function TicketDetailDialog({ ticket }: TicketDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const updateStatusMutation = useUpdateTicketStatus()

  const customerName =
    [ticket.customer.firstName, ticket.customer.lastName]
      .filter(Boolean)
      .join(' ') || ticket.customer.email

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6">{ticket.subject}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{customerName}</p>
              <p className="text-muted-foreground text-xs">
                {ticket.customer.email}
              </p>
            </div>
            <Badge variant={TICKET_STATUS_VARIANT[ticket.status]}>
              {TICKET_STATUS_TH[ticket.status]}
            </Badge>
          </div>

          {ticket.orderId && (
            <p className="text-muted-foreground font-mono text-xs">
              ออเดอร์: {ticket.orderId}
            </p>
          )}

          <div className="bg-muted/40 rounded-lg border p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.message}
            </p>
          </div>

          <p className="text-muted-foreground text-xs">
            {formatDate(ticket.createdAt)}
          </p>

          <div className="flex items-center gap-3 border-t pt-3">
            <span className="text-sm font-medium">อัปเดตสถานะ</span>
            <Select
              value={ticket.status}
              disabled={updateStatusMutation.isPending}
              onValueChange={(v) =>
                updateStatusMutation.mutate({
                  id: ticket.id,
                  status: v as TicketStatus,
                })
              }
            >
              <SelectTrigger className="w-40">
                {updateStatusMutation.isPending ? <Spinner /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                {Object.values(TicketStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {TICKET_STATUS_TH[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
