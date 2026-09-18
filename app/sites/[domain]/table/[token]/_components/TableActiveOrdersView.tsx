'use client'

import { useTranslations } from 'next-intl'

import { KitchenItemStatus } from '@/generated/prisma/enums'
import type { ActiveTableOrder } from '@/types/restaurant'
import { IconClock } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TableActiveOrdersViewProps {
  orders: ActiveTableOrder[]
  onBackToMenu: () => void
}

function getStatusBadge(status: KitchenItemStatus, t: (key: string) => string) {
  switch (status) {
    case KitchenItemStatus.COOKING:
      return <Badge variant="default">{t('tracker.cooking')}</Badge>
    case KitchenItemStatus.READY:
      return <Badge variant="secondary">{t('tracker.ready')}</Badge>
    case KitchenItemStatus.SERVED:
      return <Badge variant="outline">{t('tracker.served')}</Badge>
    case KitchenItemStatus.CANCELLED:
      return <Badge variant="destructive">{t('tracker.cancelled')}</Badge>
    case KitchenItemStatus.PENDING:
    default:
      return <Badge variant="outline">{t('tracker.pending')}</Badge>
  }
}

export function TableActiveOrdersView({
  orders,
  onBackToMenu,
}: TableActiveOrdersViewProps) {
  const t = useTranslations('storefront.tableOrder')

  if (orders.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent className="space-y-2">
          <IconClock className="text-muted-foreground mx-auto size-10 opacity-40" />
          <CardTitle className="text-base">{t('emptyOrders')}</CardTitle>
          <CardDescription>{t('emptyOrdersDesc')}</CardDescription>
          <Button size="sm" onClick={onBackToMenu} className="mt-2">
            {t('tabs.menu')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {t('tracker.orderNumber', { number: order.orderNumber })}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y p-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex-1 space-y-0.5">
                  <div className="text-sm font-medium">
                    <span className="mr-1.5 font-bold">{item.quantity}×</span>
                    {item.productTitle || item.variantTitle}
                  </div>
                  {item.variantTitle &&
                    !['ปกติ', 'Default', 'default'].includes(
                      item.variantTitle,
                    ) && (
                      <p className="text-muted-foreground text-xs">
                        {item.variantTitle}
                      </p>
                    )}
                </div>
                <div>{getStatusBadge(item.kitchenStatus, t)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
