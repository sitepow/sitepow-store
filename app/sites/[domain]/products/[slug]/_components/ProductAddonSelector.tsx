'use client'

import { useMemo } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { ProductType } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { getLocalizedField } from '@/utils/intl'
import { formatCurrency } from '@/utils/pricing'
import { getStockQuantity } from '@/utils/product'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

import { useProductPurchaseStore } from '../../store'

export function ProductAddonSelector() {
  const t = useTranslations('storefront.products')
  const locale = useLocale()
  const { store } = useStoreData()
  const { currentCurrency, convert } = useStorefrontCurrency(
    (store as any)?.baseCurrency,
  )
  const {
    product,
    selectedVariant,
    selectedBranchId,
    selectedAddons,
    toggleAddon,
    isLoading,
  } = useProductPurchaseStore()

  const hasAddons = product?.addons?.length !== 0

  const isOutOfStock = useMemo(() => {
    if (!product || product.productType === ProductType.AFFILIATE_LINK) {
      return false
    }

    const activeVariant = selectedVariant || product.variants[0]
    if (!activeVariant) {
      return true
    }

    const stock = getStockQuantity(
      activeVariant,
      product.productType,
      selectedBranchId,
    )

    return stock <= 0
  }, [product, selectedVariant, selectedBranchId])

  if (product?.productType === ProductType.AFFILIATE_LINK) {
    return null
  }

  if (isLoading) {
    return (
      <>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <Separator />
      </>
    )
  }

  return (
    <>
      {product?.addons && product.addons.length > 0 && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold">{t('addons')}</Label>
          <div className="space-y-2">
            {product.addons.map((addon) => {
              const isDisabled = !addon.isAvailable || isOutOfStock

              return (
                <Label
                  key={addon.id}
                  htmlFor={addon.id}
                  className={cn(
                    'has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors',
                    isDisabled &&
                      'cursor-not-allowed opacity-50 hover:bg-transparent',
                  )}
                >
                  <Checkbox
                    id={addon.id}
                    disabled={isDisabled}
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={() => {
                      if (!isDisabled) {
                        toggleAddon(addon.id)
                      }
                    }}
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm font-medium',
                      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    )}
                  >
                    {getLocalizedField(addon, 'title', locale) || addon.title}
                  </span>
                  <span className="text-primary text-sm font-semibold">
                    + {formatCurrency(convert(addon.price), currentCurrency)}
                  </span>
                </Label>
              )
            })}
          </div>
        </div>
      )}
      {hasAddons && <Separator />}
    </>
  )
}
