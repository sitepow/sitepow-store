'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'
import { DiscountType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart'
import { formatNumber } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconShoppingCartPlus,
} from '@tabler/icons-react'

import { ProductImage } from '@/components/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'

export interface SelectedOptionPayload {
  groupTitle: string
  choiceName: string
}

export interface SelectedAddonPayload {
  id: string
  title: string
  price: number
}

interface PosProductOptionDialogProps {
  product: POSProductItem | null
  cartItems?: CartItem[]
  onClose: () => void
  onConfirm: (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity?: number,
  ) => void
}

export function PosProductOptionDialog({
  product,
  cartItems = [],
  onClose,
  onConfirm,
}: PosProductOptionDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.pos')
  const { selectedBranchId } = useBranchFilter()

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants[0]?.id ?? '',
  )
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initialOptions: Record<string, string> = {}
    product?.options?.forEach((opt) => {
      if (opt.choices.length > 0) {
        initialOptions[opt.title] = opt.choices[0].name
      }
    })
    return initialOptions
  })
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariantId(product.variants[0].id)
    }
    setQuantity(1)
    setSelectedAddonIds([])
    const initialOptions: Record<string, string> = {}
    product?.options?.forEach((opt) => {
      if (opt.choices.length > 0) {
        initialOptions[opt.title] = opt.choices[0].name
      }
    })
    setSelectedOptions(initialOptions)
  }, [product])

  const getVariantAvailableStock = useCallback(
    (variant: POSProductItem['variants'][number]) => {
      if (product?.isReseller) {
        const resellerStock = variant.stocks[0]?.quantity ?? 0
        return getRemainingStock(cartItems, {
          variantId: variant.id,
          stock: resellerStock,
        })
      }

      if (!selectedBranchId) {
        return 0
      }

      const branchStock =
        variant.stocks.find((s) => s.branchId === selectedBranchId)?.quantity ??
        0

      return getRemainingStock(cartItems, {
        variantId: variant.id,
        stock: branchStock,
      })
    },
    [product?.isReseller, selectedBranchId, cartItems],
  )

  const currentVariant = useMemo(() => {
    if (!product) {
      return null
    }
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0]
    )
  }, [product, selectedVariantId])

  const currentVariantStock = useMemo(() => {
    if (!currentVariant) {
      return 0
    }
    return getVariantAvailableStock(currentVariant)
  }, [currentVariant, getVariantAvailableStock])

  useEffect(() => {
    if (currentVariantStock > 0 && quantity > currentVariantStock) {
      setQuantity(currentVariantStock)
    }
  }, [selectedVariantId, currentVariantStock, quantity])

  const isInvalidQuantity =
    currentVariantStock <= 0 || quantity > currentVariantStock

  const selectedOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    Object.entries(selectedOptions).forEach(([k, v]) => {
      if (v) map[k] = [v]
    })
    return map
  }, [selectedOptions])

  const unitPrice = useMemo(() => {
    if (!product || !currentVariant) {
      return 0
    }

    return calculateCartUnitPrice({
      variant: currentVariant,
      options: product.options,
      selectedOptionsMap,
      addons: product.addons,
      selectedAddonIds,
    })
  }, [product, currentVariant, selectedOptionsMap, selectedAddonIds])

  const handleConfirmAddToCart = () => {
    if (!product || !currentVariant || isInvalidQuantity) {
      return
    }

    const formattedOptions: SelectedOptionPayload[] = Object.entries(
      selectedOptions,
    ).map(([groupTitle, choiceName]) => ({
      groupTitle,
      choiceName,
    }))

    const formattedAddons: SelectedAddonPayload[] = selectedAddonIds
      .map((id) => {
        const addon = product.addons?.find((a) => a.id === id)
        if (!addon) {
          return null
        }
        return {
          id: addon.id,
          title: addon.title,
          price: addon.price,
        }
      })
      .filter((item): item is SelectedAddonPayload => item !== null)

    onConfirm(
      product,
      currentVariant.id,
      formattedOptions,
      formattedAddons,
      quantity,
    )

    onClose()
  }

  const handleOptionChange = (groupTitle: string, choiceName: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupTitle]: choiceName,
    }))
  }

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    )
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleIncrement = () => {
    if (quantity < currentVariantStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) {
      const maxVal = currentVariantStock > 0 ? currentVariantStock : 1
      const clamped = Math.max(1, Math.min(val, maxVal))
      setQuantity(clamped)
    }
  }

  if (!product) {
    return null
  }

  const activeImageUrl =
    currentVariant?.image ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url

  const isCurrentOutOfStock = currentVariantStock <= 0
  const totalPrice = unitPrice * quantity

  const currentDiscountConfig =
    currentVariant?.discountActive && currentVariant?.discountType
      ? {
          active: true,
          type: currentVariant.discountType as DiscountType,
          amount: currentVariant.discountAmount ?? 0,
        }
      : undefined

  const rawVariantPrice = Number(currentVariant?.price ?? 0)
  const netVariantPrice = calculateNetPrice({
    price: rawVariantPrice,
    discount: currentDiscountConfig,
  })
  const currentVariantHasDiscount =
    !!currentDiscountConfig && netVariantPrice < rawVariantPrice

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="bg-background border-border/80 flex max-h-[92dvh] w-[calc(100%-1.5rem)] flex-col gap-0 rounded-xl border p-0 shadow-xl sm:max-h-[88vh] sm:w-full sm:max-w-xl sm:rounded-2xl md:max-w-2xl"
      >
        <div className="border-border/60 bg-muted/20 relative flex items-center justify-between gap-3 border-b px-5 py-3.5 pr-12">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="border-border/60 bg-muted/40 relative size-12 shrink-0 overflow-hidden rounded-lg border">
              <ProductImage
                src={activeImageUrl}
                alt={product.title}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <DialogHeader className="gap-0 p-0 text-left">
                <DialogTitle className="text-foreground line-clamp-1 text-base font-semibold tracking-tight">
                  {product.title}
                </DialogTitle>
              </DialogHeader>

              <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {currentVariant?.sku && (
                  <span className="">SKU: {currentVariant.sku}</span>
                )}
                {currentVariant?.sku && <span>•</span>}
                <span
                  className={cn(
                    'font-medium',
                    isCurrentOutOfStock
                      ? 'text-destructive font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  {isCurrentOutOfStock
                    ? t('outOfStock')
                    : t('stockRemaining', {
                        count: formatNumber(currentVariantStock),
                      })}
                </span>

                {currentVariantHasDiscount &&
                  currentVariant?.discountType === DiscountType.PERCENTAGE && (
                    <Badge
                      variant="secondary"
                      className="h-4.5 border-0 bg-amber-500/10 px-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                    >
                      {t('discountBadge', {
                        amount: currentVariant.discountAmount ?? 0,
                      })}
                    </Badge>
                  )}

                {currentVariant?.pointsActive && (
                  <Badge
                    variant="secondary"
                    className="border-primary/20 bg-primary/10 text-primary h-4.5 px-1.5 text-[10px] font-medium"
                  >
                    {t('pointsBadge', {
                      amount: currentVariant.pointsAmount ?? 0,
                    })}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end pl-2">
            <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">
              {formatCurrency(unitPrice)}
            </span>
            {currentVariantHasDiscount && (
              <span className="text-muted-foreground text-xs line-through">
                {formatCurrency(rawVariantPrice)}
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[calc(92dvh-175px)] flex-1 px-5 py-4 sm:max-h-[calc(88vh-175px)] sm:px-6">
          <div className="space-y-5 pb-2">
            {product.variants.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {t('variantsAndOptions')}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {product.variants.length} รายการ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id
                    const stock = getVariantAvailableStock(variant)
                    const isOutOfStock = stock <= 0

                    const discountConfig =
                      variant.discountActive && variant.discountType
                        ? {
                            active: true,
                            type: variant.discountType as DiscountType,
                            amount: variant.discountAmount ?? 0,
                          }
                        : undefined

                    const variantPrice = Number(variant.price)
                    const netPrice = calculateNetPrice({
                      price: variantPrice,
                      discount: discountConfig,
                    })
                    const hasDiscount =
                      !!discountConfig && netPrice < variantPrice

                    const variantThumb = variant.image

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedVariantId(variant.id)
                          setQuantity(1)
                        }}
                        className={cn(
                          'relative flex flex-col justify-between rounded-lg border p-2.5 text-left transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary shadow-2xs'
                            : isOutOfStock
                              ? 'border-border/60 bg-muted/20 cursor-not-allowed border-dashed opacity-40 grayscale'
                              : 'border-border/70 bg-card hover:border-border hover:bg-muted/30 text-foreground',
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-1.5">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {variantThumb && (
                              <div className="border-border/60 size-6 shrink-0 overflow-hidden rounded border">
                                <ProductImage
                                  src={variantThumb}
                                  alt={variant.title}
                                  className="size-full object-cover"
                                />
                              </div>
                            )}
                            <span
                              className={cn(
                                'line-clamp-1 text-xs font-semibold',
                                isSelected ? 'text-primary' : 'text-foreground',
                              )}
                            >
                              {variant.title}
                            </span>
                          </div>

                          {isSelected && (
                            <IconCheck className="text-primary size-3.5 shrink-0 stroke-[2.5]" />
                          )}
                        </div>

                        <div className="mt-2 flex w-full items-baseline justify-between gap-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-foreground text-xs font-bold">
                              {formatCurrency(netPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-muted-foreground text-[10px] line-through">
                                {formatCurrency(variantPrice)}
                              </span>
                            )}
                          </div>

                          <span
                            className={cn(
                              'text-[10px]',
                              isOutOfStock
                                ? 'text-destructive font-medium'
                                : 'text-muted-foreground',
                            )}
                          >
                            {isOutOfStock
                              ? t('outOfStock')
                              : `${formatNumber(stock)}`}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {product.options?.map((option, idx) => (
              <div key={option.id || idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      {option.title}
                    </span>
                    {option.require && (
                      <span className="text-destructive text-[11px] font-medium">
                        {t('required')}
                      </span>
                    )}
                  </div>
                  {selectedOptions[option.title] && (
                    <span className="text-muted-foreground text-xs">
                      {selectedOptions[option.title]}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {option.choices.map((choice) => {
                    const isChecked =
                      selectedOptions[option.title] === choice.name
                    return (
                      <button
                        key={choice.id || choice.name}
                        type="button"
                        onClick={() =>
                          handleOptionChange(option.title, choice.name)
                        }
                        className={cn(
                          'relative flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors',
                          isChecked
                            ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                            : 'border-border/70 bg-card hover:border-border hover:bg-muted/40 text-foreground',
                        )}
                      >
                        <span>{choice.name}</span>
                        {choice.extraPrice > 0 && (
                          <span
                            className={cn(
                              'text-[11px]',
                              isChecked
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground',
                            )}
                          >
                            +{formatCurrency(choice.extraPrice)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {product.addons && product.addons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {t('toppingsAndAddons')}
                  </span>
                  {selectedAddonIds.length > 0 && (
                    <span className="text-primary text-xs font-medium">
                      เลือก {selectedAddonIds.length} รายการ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.addons.map((addon) => {
                    const isDisabled = !addon.isAvailable
                    const isChecked = selectedAddonIds.includes(addon.id)

                    return (
                      <button
                        key={addon.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleAddonToggle(addon.id)}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-2.5 text-left transition-colors sm:p-3',
                          isChecked
                            ? 'border-primary bg-primary/5 shadow-2xs'
                            : 'border-border/70 bg-card hover:border-border hover:bg-muted/40 text-foreground',
                          isDisabled &&
                            'cursor-not-allowed opacity-40 grayscale',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2.5 pr-2">
                          <span
                            className={cn(
                              'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                              isChecked
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40 bg-background',
                            )}
                          >
                            {isChecked && (
                              <IconCheck className="size-3 stroke-[2.5]" />
                            )}
                          </span>
                          <span className="text-foreground truncate text-xs sm:text-sm">
                            {addon.title}
                          </span>
                        </div>
                        <span className="text-muted-foreground shrink-0 text-xs font-medium">
                          +{formatCurrency(addon.price)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-border/70 bg-muted/15 border-t px-5 py-3.5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <div className="border-border/80 bg-background flex h-10 items-center rounded-lg border shadow-2xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-9 rounded-md disabled:opacity-30"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isCurrentOutOfStock}
                >
                  <IconMinus className="size-4" />
                </Button>
                <input
                  type="number"
                  min={1}
                  max={currentVariantStock > 0 ? currentVariantStock : 1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isCurrentOutOfStock}
                  className="text-foreground w-11 [appearance:textfield] bg-transparent text-center text-sm font-semibold outline-none sm:w-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-9 rounded-md disabled:opacity-30"
                  onClick={handleIncrement}
                  disabled={
                    quantity >= currentVariantStock || isCurrentOutOfStock
                  }
                >
                  <IconPlus className="size-4" />
                </Button>
              </div>

              <div className="flex flex-col items-end sm:hidden">
                <span className="text-muted-foreground text-[10px]">
                  {quantity} ชิ้น
                </span>
                <span className="text-foreground text-base font-bold tracking-tight">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden flex-col items-end justify-center pr-2 text-right sm:flex">
                <span className="text-muted-foreground text-[11px]">
                  รวม {quantity} ชิ้น
                </span>
                <span className="text-foreground text-base font-bold tracking-tight">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg px-4 text-xs font-medium sm:text-sm"
                onClick={onClose}
              >
                {t('cart.cancel')}
              </Button>

              <Button
                className="h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold shadow-xs sm:min-w-44 sm:flex-initial sm:px-5 sm:text-sm"
                disabled={isInvalidQuantity}
                onClick={handleConfirmAddToCart}
              >
                <IconShoppingCartPlus className="size-4 shrink-0" />
                <span className="truncate">
                  {currentVariantStock <= 0
                    ? t('outOfStock')
                    : quantity > currentVariantStock
                      ? t('insufficientStock')
                      : t('addToCartWithPrice', {
                          price: formatCurrency(totalPrice),
                        })}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
