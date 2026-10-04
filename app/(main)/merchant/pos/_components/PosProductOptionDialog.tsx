/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { POSProductItem } from '@/actions/sales/pos-product/actions'
import { QuantitySelector } from '@/app/sites/[domain]/products/[slug]/_components/QuantitySelector'
import { DiscountType } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart/cart-calculation'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import { calculateNetPrice } from '@/utils/product/product-calculation'

import { ProductImage } from '@/components/brand/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
    [selectedBranchId, cartItems],
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

  if (!product) {
    return null
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ตัวเลือกสินค้า</DialogTitle>
        </DialogHeader>
        {product?.title && (
          <div className="border-b pb-3">
            <span className="text-sm font-medium break-all whitespace-pre-line">
              {product.title}
            </span>
          </div>
        )}
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5 py-2">
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold">
                  รูปแบบสินค้า / ตัวเลือก
                </Label>
                <div className="space-y-2">
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
                    const hasPoint = variant.pointsActive

                    const imageUrl =
                      variant.image ||
                      product.images?.find((img) => img.isPrimary)?.url ||
                      product.images?.[0]?.url

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
                          'relative flex w-full items-start gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isOutOfStock
                              ? 'bg-muted/10 cursor-not-allowed opacity-40'
                              : 'border-border hover:bg-accent/50',
                        )}
                      >
                        <ProductImage src={imageUrl} />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-foreground leading-snug font-medium break-all whitespace-pre-line">
                            {variant.title}
                          </p>
                          {variant.sku && (
                            <p className="text-muted-foreground text-xs break-all">
                              SKU: {variant.sku}
                            </p>
                          )}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant={isOutOfStock ? 'outline' : 'default'}
                            >
                              {isOutOfStock
                                ? 'หมดสต็อก'
                                : `คงเหลือ: ${formatNumber(stock)} ชิ้น`}
                            </Badge>
                            {hasDiscount &&
                              variant.discountType ===
                                DiscountType.PERCENTAGE && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  ลด {variant.discountAmount}%
                                </Badge>
                              )}
                            {hasPoint && (
                              <Badge variant="outline" className="text-[10px]">
                                +{variant.pointsAmount} แต้ม
                              </Badge>
                            )}
                            {hasDiscount ? (
                              <div className="flex flex-col items-end">
                                <span className="text-primary text-sm font-semibold whitespace-nowrap">
                                  {formatCurrency(netPrice)}
                                </span>
                                <span className="text-muted-foreground text-xs whitespace-nowrap line-through">
                                  {formatCurrency(variantPrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-primary text-sm font-semibold whitespace-nowrap">
                                {formatCurrency(variantPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {product.options?.map((option, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-xs font-semibold">
                    {option.title}
                  </Label>
                  {option.require && (
                    <span className="text-destructive text-xs font-medium">
                      * จำเป็น
                    </span>
                  )}
                </div>
                <RadioGroup
                  value={selectedOptions[option.title] ?? ''}
                  onValueChange={(val) => handleOptionChange(option.title, val)}
                  className="gap-2"
                >
                  {option.choices.map((choice) => {
                    const isChecked =
                      selectedOptions[option.title] === choice.name
                    return (
                      <Label
                        key={choice.name}
                        htmlFor={`${option.title}-${choice.name}`}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors',
                          isChecked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent/50',
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center space-x-3 pr-2">
                          <RadioGroupItem
                            value={choice.name}
                            id={`${option.title}-${choice.name}`}
                          />
                          <span className="text-sm font-medium break-all whitespace-pre-line">
                            {choice.name}
                          </span>
                        </div>
                        {choice.extraPrice > 0 && (
                          <span className="text-primary shrink-0 text-xs font-medium whitespace-nowrap">
                            +{formatCurrency(choice.extraPrice)}
                          </span>
                        )}
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>
            ))}
            {product.addons && product.addons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold">
                  ท็อปปิ้ง / บริการเสริม
                </Label>
                <div className="grid gap-2">
                  {product.addons.map((addon) => {
                    const isDisabled = !addon.isAvailable
                    const isChecked = selectedAddonIds.includes(addon.id)

                    return (
                      <Label
                        key={addon.id}
                        htmlFor={addon.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors',
                          isChecked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent/50',
                          isDisabled &&
                            'cursor-not-allowed opacity-50 hover:bg-transparent',
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center space-x-3 pr-2">
                          <Checkbox
                            id={addon.id}
                            disabled={isDisabled}
                            checked={isChecked}
                            onCheckedChange={() => handleAddonToggle(addon.id)}
                          />
                          <span className="text-sm font-medium break-all whitespace-pre-line">
                            {addon.title}
                          </span>
                        </div>
                        <span className="text-primary shrink-0 font-semibold whitespace-nowrap">
                          + {formatCurrency(addon.price)}
                        </span>
                      </Label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={currentVariantStock > 0 ? currentVariantStock : 1}
          />
          <Button
            size="lg"
            className="w-full min-w-40 font-semibold sm:w-auto"
            disabled={isInvalidQuantity}
            onClick={handleConfirmAddToCart}
          >
            {currentVariantStock <= 0
              ? 'สินค้าหมด'
              : quantity > currentVariantStock
                ? 'สินค้าไม่พอ'
                : `เพิ่มลงตะกร้า ${formatCurrency(unitPrice * quantity)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
