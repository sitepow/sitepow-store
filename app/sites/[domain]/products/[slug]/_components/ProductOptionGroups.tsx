'use client'

import { useMemo } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { ProductType } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { getLocalizedField } from '@/utils/intl'
import { formatCurrency } from '@/utils/pricing'
import { getStockQuantity } from '@/utils/product'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

import { useProductPurchaseStore } from '../../store'

export function ProductOptionGroups() {
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
    selectedOptions,
    toggleOption,
    isLoading,
  } = useProductPurchaseStore()

  const hasOptionGroups = product?.options?.length !== 0

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
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
        <Separator />
      </>
    )
  }

  return (
    <>
      {product?.options?.map((option, idx) => (
        <div key={idx} className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-lg font-semibold">
              {getLocalizedField(option, 'title', locale) || option.title}
            </Label>
            {option.require && (
              <Badge variant="outline" className="border-primary text-primary">
                * {t('required')}
              </Badge>
            )}
          </div>
          <RadioGroup
            value={selectedOptions[option.title]?.[0] ?? ''}
            onValueChange={(val) => {
              if (!isOutOfStock) {
                toggleOption(option.title, val, 1)
              }
            }}
            disabled={isOutOfStock}
          >
            <div className="grid grid-cols-1 gap-2">
              {option.choices.map((choice) => {
                const choiceId = `${option.title}-${choice.name}`

                return (
                  <Label
                    key={choice.name}
                    htmlFor={choiceId}
                    className={cn(
                      'has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors',
                      isOutOfStock && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <RadioGroupItem
                      value={choice.name}
                      id={choiceId}
                      disabled={isOutOfStock}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {getLocalizedField(choice, 'name', locale) || choice.name}
                    </span>
                    {choice.extraPrice > 0 && (
                      <span className="text-primary text-sm font-semibold">
                        +
                        {formatCurrency(
                          convert(choice.extraPrice),
                          currentCurrency,
                        )}
                      </span>
                    )}
                  </Label>
                )
              })}
            </div>
          </RadioGroup>
        </div>
      ))}
      {hasOptionGroups && <Separator />}
    </>
  )
}
