'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface AggregatedKitchenItem {
  title: string
  variantTitle: string
  quantity: number
  tables: string[]
}

interface KitchenAggregatedViewProps {
  items: AggregatedKitchenItem[]
}

export function KitchenAggregatedView({ items }: KitchenAggregatedViewProps) {
  const t = useTranslations('merchant.kitchen')

  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, idx) => (
        <Card key={idx} className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  {item.title}
                </CardTitle>
                {item.variantTitle && (
                  <CardDescription className="text-xs">
                    {item.variantTitle}
                  </CardDescription>
                )}
              </div>
              <Badge
                variant="default"
                className="px-2.5 py-0.5 text-base font-bold"
              >
                {item.quantity}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="text-muted-foreground border-t pt-2 text-xs">
            <span className="text-foreground mr-1 font-semibold">
              {t('fromTables')}
            </span>
            {item.tables.join(', ')}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
