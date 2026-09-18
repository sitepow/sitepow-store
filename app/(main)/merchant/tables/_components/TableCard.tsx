'use client'

import { useTranslations } from 'next-intl'

import { TableStatus } from '@/generated/prisma/enums'
import type { RestaurantTableItem } from '@/types/restaurant'
import {
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconPrinter,
  IconRefresh,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TableCardProps {
  table: RestaurantTableItem
  onPrint: (table: RestaurantTableItem) => void
  onEdit: (table: RestaurantTableItem) => void
  onDelete: (id: string, tableNumber: string) => void
  onRegenerateQR: (id: string, tableNumber: string) => void
}

export function TableCard({
  table,
  onPrint,
  onEdit,
  onDelete,
  onRegenerateQR,
}: TableCardProps) {
  const t = useTranslations('merchant.tables')
  const isOccupied = table.status === TableStatus.OCCUPIED
  const isBillRequested = table.status === TableStatus.BILL_REQUESTED

  const statusVariant = isBillRequested
    ? 'destructive'
    : isOccupied
      ? 'default'
      : 'outline'

  const statusLabel = isBillRequested
    ? t('status.billRequested')
    : isOccupied
      ? t('status.occupied')
      : t('status.available')

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">
              {t('tablePrefix')} {table.tableNumber}
            </CardTitle>
            <CardDescription className="text-xs">
              {table.zone?.name
                ? t('zonePrefix', { zone: table.zone.name })
                : t('noZone')}
            </CardDescription>
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="text-muted-foreground space-y-2 pb-4 text-sm">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <IconUsers className="size-4" />
            {t('seats', { count: table.seats })}
          </span>
          {isOccupied && table.currentSessionId && (
            <span className="text-foreground flex items-center gap-1.5 font-medium">
              <IconClock className="size-4" />
              {t('orders', { count: 1 })}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onPrint(table)}
        >
          <IconPrinter className="mr-2 size-4" />
          {t('actions.print')}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="size-8">
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onRegenerateQR(table.id, table.tableNumber)}
            >
              <IconRefresh className="mr-2 size-4" />
              {t('actions.regenerate')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(table)}>
              <IconEdit className="mr-2 size-4" />
              {t('actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(table.id, table.tableNumber)}
            >
              <IconTrash className="mr-2 size-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
