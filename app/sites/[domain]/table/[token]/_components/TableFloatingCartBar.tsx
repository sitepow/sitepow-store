'use client'

import { useTranslations } from 'next-intl'

import { formatCurrency } from '@/utils/pricing'
import { IconShoppingCart } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

interface TableFloatingCartBarProps {
  totalCartCount: number
  cartTotal: number
  onOpenCart: () => void
}

export function TableFloatingCartBar({
  totalCartCount,
  cartTotal,
  onOpenCart,
}: TableFloatingCartBarProps) {
  const t = useTranslations('storefront.tableOrder')

  if (totalCartCount <= 0) return null

  return (
    <div className="fixed right-0 bottom-4 left-0 z-40 flex justify-center px-4">
      <Button
        size="lg"
        className="w-full max-w-md gap-2 shadow-lg"
        onClick={onOpenCart}
      >
        <IconShoppingCart className="size-5" />
        <span className="flex-1 text-left">
          {t('viewCart', { count: totalCartCount })}
        </span>
        <span className="font-bold">
          {formatCurrency(cartTotal)} {t('baht')}
        </span>
      </Button>
    </div>
  )
}
