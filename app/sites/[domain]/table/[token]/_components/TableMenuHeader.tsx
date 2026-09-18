'use client'

import { useTranslations } from 'next-intl'

import { IconBell, IconToolsKitchen2 } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TableMenuHeaderProps {
  storeName?: string
  storeLogo?: string | null
  tableNumber: string
  zoneName?: string | null
  hasRequestedBill: boolean
  onRequestBill: () => void
  isRequestingBill?: boolean
}

export function TableMenuHeader({
  storeName,
  storeLogo,
  tableNumber,
  zoneName,
  hasRequestedBill,
  onRequestBill,
  isRequestingBill,
}: TableMenuHeaderProps) {
  const t = useTranslations('storefront.tableOrder')

  return (
    <>
      <header className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName || 'Store'}
                className="size-10 flex-shrink-0 rounded-full border object-contain p-0.5"
              />
            ) : (
              <div className="bg-primary/10 text-primary flex size-10 flex-shrink-0 items-center justify-center rounded-full">
                <IconToolsKitchen2 className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm leading-tight font-bold">
                {storeName}
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {t('tableBadge', { number: tableNumber })}
                </Badge>
                {zoneName && (
                  <span className="text-muted-foreground text-xs">
                    {t('zoneBadge', { name: zoneName })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant={hasRequestedBill ? 'secondary' : 'outline'}
            onClick={onRequestBill}
            disabled={hasRequestedBill || isRequestingBill}
            className="flex-shrink-0"
          >
            <IconBell className="mr-1.5 size-4" />
            {hasRequestedBill ? t('billRequested') : t('callStaff')}
          </Button>
        </div>
      </header>

      {hasRequestedBill && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive border-b px-4 py-2 text-center text-xs font-medium">
          {t('billRequestedDesc')}
        </div>
      )}
    </>
  )
}
