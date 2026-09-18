'use client'

import { KitchenItemStatus } from '@/generated/prisma/enums'
import { KitchenTicketOrder } from '@/types/restaurant'

import { KitchenEmptyState } from './KitchenEmptyState'
import { KitchenTicketCard } from './KitchenTicketCard'

interface KitchenTicketGridProps {
  orders: KitchenTicketOrder[]
  onItemStatusChange: (
    orderItemId: string,
    nextStatus: KitchenItemStatus,
  ) => Promise<void>
  onTicketStatusChange: (
    orderId: string,
    status: KitchenItemStatus,
  ) => Promise<void>
}

export function KitchenTicketGrid({
  orders,
  onItemStatusChange,
  onTicketStatusChange,
}: KitchenTicketGridProps) {
  if (orders.length === 0) {
    return <KitchenEmptyState />
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((order) => (
        <KitchenTicketCard
          key={order.id}
          order={order}
          onItemStatusChange={onItemStatusChange}
          onTicketStatusChange={onTicketStatusChange}
        />
      ))}
    </div>
  )
}
