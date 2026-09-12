'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'
import { DiscountType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'
import {
  IconBox,
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
        className="bg-background flex max-h-[94dvh] w-[calc(100%-1rem)] flex-col gap-0 rounded-2xl border p-0 shadow-2xl sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:rounded-3xl lg:max-w-3xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        <div className="border-border/70 bg-muted/20 relative flex flex-col justify-between gap-3 border-b px-4 py-3.5 pr-12 sm:flex-row sm:items-center sm:px-6 sm:py-4 sm:pr-14">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-3.5">
            <div className="border-border/80 bg-background relative size-14 shrink-0 overflow-hidden rounded-xl border shadow-xs sm:size-16">
              <ProductImage
                src={activeImageUrl}
                alt={product.title}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
                  <IconBox className="size-3" />
                  {t('productOptions')}
                </span>
                {currentVariant?.sku && (
                  <span className="text-muted-foreground truncate text-[11px] font-medium">
                    SKU: {currentVariant.sku}
                  </span>
                )}
              </div>

              <h2 className="text-foreground line-clamp-1 text-sm leading-snug font-bold sm:text-base lg:text-lg">
                {product.title}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold sm:text-xs',
                    isCurrentOutOfStock
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      isCurrentOutOfStock ? 'bg-destructive' : 'bg-emerald-500',
                    )}
                  />
                  {isCurrentOutOfStock
                    ? t('outOfStock')
                    : t('stockRemaining', {
                        count: formatNumber(currentVariantStock),
                      })}
                </span>

                {currentVariantHasDiscount &&
                  currentVariant?.discountType === DiscountType.PERCENTAGE && (
                    <Badge
                      variant="outline"
                      className="h-5 border-amber-500/30 bg-amber-500/10 px-1.5 text-[10px] font-semibold text-amber-600 sm:text-xs dark:text-amber-400"
                    >
                      {t('discountBadge', {
                        amount: currentVariant.discountAmount ?? 0,
                      })}
                    </Badge>
                  )}

                {currentVariant?.pointsActive && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-primary h-5 px-1.5 text-[10px] font-medium sm:text-xs"
                  >
                    {t('pointsBadge', {
                      amount: currentVariant.pointsAmount ?? 0,
                    })}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="border-border/40 flex shrink-0 items-baseline justify-between border-t pt-2 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
            <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              {t('cart.subtotal')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-primary text-lg font-black tracking-tight sm:text-2xl">
                {formatCurrency(unitPrice)}
              </span>
              {currentVariantHasDiscount && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(rawVariantPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(94dvh-200px)] flex-1 px-4 py-3.5 sm:max-h-[calc(90vh-190px)] sm:px-6 sm:py-4">
          <div className="space-y-5 pb-2 sm:space-y-6">
            {product.variants.length > 1 && (
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary size-2 rounded-full" />
                    <h3 className="text-foreground text-sm font-bold">
                      {t('variantsAndOptions')}
                    </h3>
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">
                    {product.variants.length} รายการ
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-2.5">
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
                          'group relative flex min-h-17.5 flex-col justify-between rounded-xl border-2 p-2.5 text-left transition-all active:scale-[0.98] sm:min-h-19 sm:p-3',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-primary/20 shadow-xs ring-2'
                            : isOutOfStock
                              ? 'border-border bg-muted/20 cursor-not-allowed border-dashed opacity-40 grayscale'
                              : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30',
                        )}
                      >
                        <div className="flex w-full items-start justify-between gap-1.5">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {variantThumb && (
                              <div className="border-border/60 size-7 shrink-0 overflow-hidden rounded-md border">
                                <ProductImage
                                  src={variantThumb}
                                  alt={variant.title}
                                  className="size-full object-cover"
                                />
                              </div>
                            )}
                            <span
                              className={cn(
                                'line-clamp-2 text-xs leading-tight font-bold sm:text-sm',
                                isSelected ? 'text-primary' : 'text-foreground',
                              )}
                            >
                              {variant.title}
                            </span>
                          </div>

                          {isSelected && (
                            <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full shadow-xs">
                              <IconCheck className="size-3.5 stroke-3" />
                            </span>
                          )}
                        </div>

                        <div className="border-border/40 mt-2.5 flex w-full items-end justify-between gap-1 border-t pt-1.5 sm:mt-3">
                          <div className="flex min-w-0 flex-col">
                            <span className="text-foreground text-xs font-black sm:text-sm">
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
                              'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                              isOutOfStock
                                ? 'text-destructive bg-destructive/10'
                                : 'text-muted-foreground bg-muted',
                            )}
                          >
                            {isOutOfStock
                              ? t('outOfStock')
                              : `${formatNumber(stock)} ชิ้น`}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {product.options?.map((option, idx) => (
              <div key={option.id || idx} className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary size-2 rounded-full" />
                    <h3 className="text-foreground text-sm font-bold">
                      {option.title}
                    </h3>
                    {option.require && (
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-[10px] font-bold"
                      >
                        {t('required')}
                      </Badge>
                    )}
                  </div>
                  {selectedOptions[option.title] && (
                    <span className="text-primary text-xs font-semibold">
                      {selectedOptions[option.title]}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-2 sm:grid-cols-3 sm:gap-2">
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
                          'relative flex min-h-11 items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left text-xs font-medium transition-all active:scale-[0.98] sm:min-h-11.5 sm:px-3.5 sm:py-2.5 sm:text-sm',
                          isChecked
                            ? 'border-primary bg-primary/10 text-primary ring-primary/20 font-bold shadow-xs ring-2'
                            : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30 text-foreground',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              'flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                              isChecked
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40',
                            )}
                          >
                            {isChecked && (
                              <span className="bg-background size-1.5 rounded-full" />
                            )}
                          </span>
                          <span className="truncate">{choice.name}</span>
                        </div>
                        {choice.extraPrice > 0 && (
                          <span
                            className={cn(
                              'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:text-xs',
                              isChecked
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground',
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
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary size-2 rounded-full" />
                    <h3 className="text-foreground text-sm font-bold">
                      {t('toppingsAndAddons')}
                    </h3>
                  </div>
                  {selectedAddonIds.length > 0 && (
                    <span className="text-primary text-xs font-semibold">
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
                          'flex min-h-11.5 items-center justify-between rounded-xl border-2 p-2.5 text-left transition-all active:scale-[0.98] sm:min-h-12.5 sm:p-3',
                          isChecked
                            ? 'border-primary bg-primary/10 ring-primary/20 shadow-xs ring-2'
                            : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30 text-foreground',
                          isDisabled &&
                            'hover:bg-card cursor-not-allowed opacity-40 grayscale',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2.5 pr-2">
                          <span
                            className={cn(
                              'flex size-4.5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors sm:size-5',
                              isChecked
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40 bg-background',
                            )}
                          >
                            {isChecked && (
                              <IconCheck className="size-3.5 stroke-3" />
                            )}
                          </span>
                          <span
                            className={cn(
                              'truncate text-xs font-semibold sm:text-sm',
                              isChecked ? 'text-primary' : 'text-foreground',
                            )}
                          >
                            {addon.title}
                          </span>
                        </div>
                        <span className="text-primary bg-primary/10 shrink-0 rounded-md px-2 py-1 text-xs font-bold">
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

        <div className="border-border/80 bg-card/95 border-t p-3 backdrop-blur-xs sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <div className="border-border/80 bg-muted/40 flex items-center rounded-xl border p-1 shadow-2xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-card hover:bg-muted size-9 rounded-lg shadow-2xs active:scale-95 disabled:opacity-30 sm:size-11"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isCurrentOutOfStock}
                >
                  <IconMinus className="size-4 stroke-[2.5] sm:size-4.5" />
                </Button>
                <input
                  type="number"
                  min={1}
                  max={currentVariantStock > 0 ? currentVariantStock : 1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isCurrentOutOfStock}
                  className="text-foreground w-11 [appearance:textfield] bg-transparent text-center text-base font-black outline-none sm:w-14 sm:text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-card hover:bg-muted size-9 rounded-lg shadow-2xs active:scale-95 disabled:opacity-30 sm:size-11"
                  onClick={handleIncrement}
                  disabled={
                    quantity >= currentVariantStock || isCurrentOutOfStock
                  }
                >
                  <IconPlus className="size-4 stroke-[2.5] sm:size-4.5" />
                </Button>
              </div>

              <div className="flex flex-col items-end sm:hidden">
                <span className="text-muted-foreground text-[10px] font-medium">
                  {quantity} ชิ้น
                </span>
                <span className="text-primary text-base font-black tracking-tight">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden flex-col items-end justify-center pr-1 text-right sm:flex">
                <span className="text-muted-foreground text-[11px] font-medium">
                  รวม {quantity} ชิ้น
                </span>
                <span className="text-foreground text-lg font-black tracking-tight">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="text-muted-foreground hover:text-foreground h-11 rounded-xl px-3.5 text-xs font-semibold active:scale-95 sm:h-12 sm:px-5 sm:text-sm"
                onClick={onClose}
              >
                {t('cart.cancel')}
              </Button>

              <Button
                size="lg"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold shadow-md active:scale-[0.98] sm:h-12 sm:min-w-55 sm:flex-initial sm:px-6 sm:text-base"
                disabled={isInvalidQuantity}
                onClick={handleConfirmAddToCart}
              >
                <IconShoppingCartPlus className="size-4.5 shrink-0 sm:size-5" />
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
