/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { EmptyImage } from '@/app/sites/[domain]/_components/EmptyImage'
import { QuantitySelector } from '@/app/sites/[domain]/products/[slug]/_components/QuantitySelector'
import { DiscountType } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold">
            {product.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            เลือกรูปแบบ ตัวเลือกเพิ่มเติม และจำนวนสินค้าสำหรับรายการนี้
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5 py-2">
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold">
                  รูปแบบสินค้า
                </Label>
                <RadioGroup
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                  className="gap-2"
                >
                  {product.variants.map((variant) => {
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

                    return (
                      <Label
                        key={variant.id}
                        htmlFor={variant.id}
                        className={cn(
                          'hover:bg-accent/50 flex cursor-pointer flex-col gap-3 rounded-md border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between',
                          'has-checked:border-primary has-checked:bg-accent/50',
                          isOutOfStock &&
                            'cursor-not-allowed opacity-50 hover:bg-transparent',
                        )}
                      >
                        <div className="flex w-full items-start space-x-3 sm:items-center">
                          <RadioGroupItem
                            value={variant.id}
                            id={variant.id}
                            className="mt-1 sm:mt-0"
                          />
                          <EmptyImage className="size-14 shrink-0 text-[8px] sm:size-16" />
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-sm leading-tight font-medium wrap-break-word">
                              {variant.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-muted-foreground text-xs">
                                คงเหลือ: {stock}
                                {variant?.sku ? ` · SKU: ${variant.sku}` : ''}
                              </span>
                              <br />
                              {hasDiscount &&
                                variant.discountType ===
                                  DiscountType.PERCENTAGE && (
                                  <Badge>ลด {variant.discountAmount}%</Badge>
                                )}
                              {hasPoint && (
                                <Badge>+{variant.pointsAmount} แต้ม</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-baseline justify-between border-t pt-2 text-right sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                          <span className="text-muted-foreground mr-2.5 text-xs sm:hidden">
                            ราคา
                          </span>
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
                              <span className="text-primary text-sm font-semibold">
                                {formatCurrency(netPrice)}
                              </span>
                              <span className="text-muted-foreground text-xs line-through">
                                {formatCurrency(variantPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-primary text-sm font-semibold">
                              {formatCurrency(variantPrice)}
                            </span>
                          )}
                        </div>
                      </Label>
                    )
                  })}
                </RadioGroup>
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
                  {option.choices.map((choice) => (
                    <Label
                      key={choice.name}
                      htmlFor={`${option.title}-${choice.name}`}
                      className={cn(
                        'hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors',
                        'has-checked:border-primary has-checked:bg-accent/50',
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={choice.name}
                          id={`${option.title}-${choice.name}`}
                        />
                        <span className="text-sm leading-none font-medium">
                          {choice.name}
                        </span>
                      </div>
                      {choice.extraPrice > 0 && (
                        <span className="text-primary text-xs font-medium">
                          +{formatCurrency(choice.extraPrice)}
                        </span>
                      )}
                    </Label>
                  ))}
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

                    return (
                      <Label
                        key={addon.id}
                        htmlFor={addon.id}
                        className={cn(
                          'hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors',
                          'has-checked:border-primary has-checked:bg-accent/50',
                          isDisabled &&
                            'cursor-not-allowed opacity-50 hover:bg-transparent',
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={addon.id}
                            disabled={isDisabled}
                            checked={selectedAddonIds.includes(addon.id)}
                            onCheckedChange={() => handleAddonToggle(addon.id)}
                          />
                          <span className="text-sm leading-none font-medium">
                            {addon.title}
                          </span>
                        </div>
                        <span className="text-primary font-semibold">
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
