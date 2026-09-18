'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import type { CartItem } from '@/types/sites/cart'
import { getRemainingStock } from '@/utils/cart'
import { IconAlertCircle } from '@tabler/icons-react'
import { ChevronLeftIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { CartItemCard } from '../../_components/cart/_components/CartItemCard'

interface PhysicalGroup {
  branchId: string
  branchName?: string
}

interface CartItemsListProps {
  items: CartItem[]
  physicalGroups: PhysicalGroup[]
  onRemoveItem: (cartItemId: string) => void
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
}

export function CartItemsList({
  items,
  physicalGroups,
  onRemoveItem,
  onUpdateQuantity,
}: CartItemsListProps) {
  const t = useTranslations('storefront.cart')

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-40 lg:col-span-8">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground -ml-4">
            <ChevronLeftIcon />
            <span>{t('editItems')}</span>
          </Button>
        </Link>
      </div>

      <div className="border-border flex flex-col rounded-xl border">
        <div className="rounded-xl px-5 py-2.5 text-start font-bold">
          <h2>
            {t('cartItems')}{' '}
            {physicalGroups.length > 0 && (
              <span className="text-primary text-xs font-normal">
                ({t('shippingFromBranch')}{' '}
                {physicalGroups
                  .map((g) => g.branchName)
                  .filter(Boolean)
                  .join(', ')}
                )
              </span>
            )}
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="p-5">
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <IconAlertCircle /> {t('empty')}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-8 p-5 text-start">
            {items.map((item) => {
              const stock = item.variant.stocks
                .filter(
                  (s: { branchId: string; quantity: number }) =>
                    s.branchId === item.branchId,
                )
                .reduce(
                  (sum: number, s: { branchId: string; quantity: number }) =>
                    sum + s.quantity,
                  0,
                )

              return (
                <CartItemCard
                  key={item.cartItemId}
                  item={item}
                  onRemove={onRemoveItem}
                  onUpdateQuantity={onUpdateQuantity}
                  productClassName="sm:w-1/2"
                  isMaxStock={
                    item.quantity >=
                    getRemainingStock(items, {
                      variantId: item.variant.id,
                      stock,
                      excludeCartItemId: item.cartItemId,
                    })
                  }
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
