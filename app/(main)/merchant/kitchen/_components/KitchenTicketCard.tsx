'use client'

import { useTranslations } from 'next-intl'

import { KitchenItemStatus } from '@/generated/prisma/enums'
import { cn } from '@/lib/utils'
import type { KitchenTicketOrder } from '@/types/restaurant'
import { IconCheck, IconClock, IconFlame } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface KitchenTicketCardProps {
  order: KitchenTicketOrder
  onItemStatusChange: (orderItemId: string, nextStatus: KitchenItemStatus) => void
  onTicketStatusChange: (orderId: string, status: KitchenItemStatus) => void
}

function getElapsedMinutes(dateStr: string | Date): number {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / 60000))
}

export function KitchenTicketCard({
  order,
  onItemStatusChange,
  onTicketStatusChange,
}: KitchenTicketCardProps) {
  const t = useTranslations('merchant.kitchen')
  const elapsed = getElapsedMinutes(order.createdAt)
  const isDelayed = elapsed >= 20
  const isWarning = elapsed >= 10 && elapsed < 20

  const allPending = order.items.every(
    (i) => i.kitchenStatus === KitchenItemStatus.PENDING,
  )
  const allReady = order.items.every(
    (i) =>
      i.kitchenStatus === KitchenItemStatus.READY ||
      i.kitchenStatus === KitchenItemStatus.SERVED,
  )

  return (
    <Card
      className={cn(
        'flex flex-col justify-between transition-colors',
        isDelayed && 'border-destructive/60 bg-destructive/5',
        isWarning && !isDelayed && 'border-amber-500/50 bg-amber-500/5',
      )}
    >
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                {order.table?.tableNumber
                  ? `${t('tablePrefix')} ${order.table.tableNumber}`
                  : t('takeaway')}
              </CardTitle>
              {order.table?.zone?.name && (
                <Badge variant="secondary" className="text-xs">
                  {order.table.zone.name}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              #{order.orderNumber}
            </CardDescription>
          </div>

          <Badge
            variant={
              isDelayed ? 'destructive' : isWarning ? 'secondary' : 'outline'
            }
            className="gap-1 text-xs"
          >
            <IconClock className="size-3" />
            {t('minutes', { count: elapsed })}
          </Badge>
        </div>
      </CardHeader>

      {order.customerNote && (
        <div className="bg-muted text-muted-foreground border-b px-4 py-2 text-xs font-medium">
          {t('kitchenNote', { note: order.customerNote })}
        </div>
      )}

      <CardContent className="flex-1 divide-y p-4">
        {order.items.map((item) => {
          const isItemPending = item.kitchenStatus === KitchenItemStatus.PENDING
          const isCooking = item.kitchenStatus === KitchenItemStatus.COOKING
          const isReady = item.kitchenStatus === KitchenItemStatus.READY
          const isServed = item.kitchenStatus === KitchenItemStatus.SERVED
          const displayTitle = item.productTitle || item.variantTitle

          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex-1 space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-primary min-w-[20px] text-sm font-bold">
                    {item.quantity}×
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isReady && 'text-muted-foreground line-through',
                    )}
                  >
                    {displayTitle}
                  </span>
                </div>
                {item.variantTitle &&
                  !['ปกติ', 'Default', 'default'].includes(item.variantTitle) && (
                    <p className="text-muted-foreground text-xs">
                      {t('variantPrefix', { variant: item.variantTitle })}
                    </p>
                  )}
                {item.customerNote && (
                  <p className="text-primary text-xs font-medium">
                    ★ {item.customerNote}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                {isItemPending && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onItemStatusChange(item.id, KitchenItemStatus.COOKING)
                    }
                  >
                    {t('startCooking')}
                  </Button>
                )}
                {isCooking && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      onItemStatusChange(item.id, KitchenItemStatus.READY)
                    }
                  >
                    {t('finishCooking')}
                  </Button>
                )}
                {isReady && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onItemStatusChange(item.id, KitchenItemStatus.SERVED)
                    }
                  >
                    <IconCheck className="mr-1 size-3.5" />
                    {t('served')}
                  </Button>
                )}
                {isServed && <Badge variant="outline">{t('served')}</Badge>}
              </div>
            </div>
          )
        })}
      </CardContent>

      <CardFooter className="border-t pt-3">
        {allPending ? (
          <Button
            size="sm"
            className="w-full"
            onClick={() =>
              onTicketStatusChange(order.id, KitchenItemStatus.COOKING)
            }
          >
            <IconFlame className="mr-2 size-4" />
            {t('startAll')}
          </Button>
        ) : !allReady ? (
          <Button
            size="sm"
            variant="default"
            className="w-full"
            onClick={() =>
              onTicketStatusChange(order.id, KitchenItemStatus.READY)
            }
          >
            <IconCheck className="mr-2 size-4" />
            {t('readyAll')}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onTicketStatusChange(order.id, KitchenItemStatus.SERVED)
            }
          >
            {t('completeTicket')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

