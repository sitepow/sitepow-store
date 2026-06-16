'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
import {
  DELIVERY_STATUS_TH,
  ORDER_STATUS_TH,
  PAYMENT_METHOD_TH,
} from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import { IconEye } from '@tabler/icons-react'
import { User2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

interface OrderDetailDialogProps {
  order: GetOrdersItem
}

export function OrderDetailDialog({ order }: OrderDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const updateStatusMutation = useUpdateOrderStatus()

  const customerName = order.customer
    ? [order.customer.firstName, order.customer.lastName]
        .filter(Boolean)
        .join(' ')
    : (order.guestName ?? '-')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ออเดอร์ #{order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center">
              <Avatar className="size-8 border">
                <AvatarFallback>
                  <User2 size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 max-w-72 space-y-1 wrap-break-word whitespace-pre-line">
                <p className="text-sm leading-none font-medium">
                  {customerName || 'ลูกค้า'}
                </p>
                <p className="text-muted-foreground text-sm">
                  {order.customer?.email ?? order.guestEmail ?? '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{ORDER_STATUS_TH[order.status]}</Badge>
            <Badge variant="outline">
              {DELIVERY_STATUS_TH[order.deliveryStatus]}
            </Badge>
            {order.paymentMethod && (
              <Badge variant="secondary">
                {PAYMENT_METHOD_TH[order.paymentMethod]}
              </Badge>
            )}
          </div>

          {order.trackingNumber && (
            <p className="text-muted-foreground font-mono text-xs">
              Tracking: {order.trackingNumber}
            </p>
          )}

          <div className="rounded-lg border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b px-3 py-2.5 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.variantTitle} · x{item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatCurrency(Number(item.price))}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t pt-3">
            <span className="font-medium">ยอดรวม</span>
            <span className="font-semibold">
              {formatCurrency(Number(order.totalAmount))}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <span className="text-sm font-medium">อัปเดตสถานะ</span>
            <Select
              value={order.status}
              disabled={updateStatusMutation.isPending}
              onValueChange={(v) =>
                updateStatusMutation.mutate({
                  id: order.id,
                  status: v as OrderStatus,
                })
              }
            >
              <SelectTrigger className="w-44">
                {updateStatusMutation.isPending ? <Spinner /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_TH[s]}
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
