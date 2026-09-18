'use client'

import { useTranslations } from 'next-intl'

import type { TableMenuProductItem } from '@/types/restaurant'
import { formatCurrency } from '@/utils/pricing'
import { IconPlus, IconToolsKitchen2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'

interface TableProductCardProps {
  product: TableMenuProductItem
  onSelect: (product: TableMenuProductItem) => void
}

export function TableProductCard({ product, onSelect }: TableProductCardProps) {
  const t = useTranslations('storefront.tableOrder')

  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <div className="flex gap-3 p-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="size-20 flex-shrink-0 rounded-md border object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex size-20 flex-shrink-0 items-center justify-center rounded-md">
            <IconToolsKitchen2 className="size-6 opacity-40" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="line-clamp-1 text-sm font-semibold">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {product.description}
            </p>
          )}
          <p className="text-primary pt-0.5 text-sm font-bold">
            {formatCurrency(product.defaultPrice)} {t('baht')}
          </p>
        </div>
      </div>

      <CardFooter className="flex justify-end p-3 pt-0">
        <Button size="sm" variant="outline" onClick={() => onSelect(product)}>
          <IconPlus className="mr-1 size-3.5" />
          {t('selectOptions')}
        </Button>
      </CardFooter>
    </Card>
  )
}
