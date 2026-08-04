'use client'

import { useMemo, useState } from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { QuantitySelector } from '@/app/sites/[domain]/products/[slug]/_components/QuantitySelector'
import { DiscountType } from '@/generated/prisma/enums'
import { calculateCartUnitPrice } from '@/utils/cart'
import { formatCurrency } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'

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
  onClose,
  onConfirm,
}: PosProductOptionDialogProps) {
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

  const getVariantStock = (variant: POSProductItem['variants'][number]) => {
    return variant.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0)
  }

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
    return getVariantStock(currentVariant)
  }, [currentVariant])

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
    if (!product || !currentVariant || currentVariantStock <= 0) {
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
    if (currentVariantStock <= 0) return
    setSelectedOptions((prev) => ({
      ...prev,
      [groupTitle]: choiceName,
    }))
  }

  const handleAddonToggle = (addonId: string) => {
    if (currentVariantStock <= 0) return
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
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            เลือกตัวเลือกสินค้า: {product.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-6 py-2">
            {(product.variants.length > 1 ||
              (currentVariant?.pointsActive &&
                (currentVariant?.pointsAmount ?? 0) > 0)) && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  ตัวเลือกสินค้า
                </Label>
                <RadioGroup
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                  className="grid gap-2"
                >
                  {product.variants.map((variant) => {
                    const stock = getVariantStock(variant)
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
                          'has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-start space-x-3 rounded-lg border p-3 transition-colors',
                          isOutOfStock && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <RadioGroupItem
                          value={variant.id}
                          id={variant.id}
                          disabled={isOutOfStock}
                          className="mt-0.5"
                        />
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="font-medium">{variant.title}</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {hasDiscount &&
                              variant.discountType ===
                                DiscountType.PERCENTAGE && (
                                <span className="text-primary text-[10px] font-semibold">
                                  ส่วนลด {variant.discountAmount}%
                                </span>
                              )}
                            {hasPoint && (
                              <span className="text-primary text-[10px] font-semibold">
                                + {variant.pointsAmount} แต้ม
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground text-[10px]">
                            คงเหลือ: {stock} ชิ้น
                            {variant?.sku ? `, SKU: ${variant.sku}` : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          {hasDiscount ? (
                            <div className="flex flex-col items-end">
                              <span className="text-primary text-sm font-bold">
                                {formatCurrency(netPrice)}
                              </span>
                              <span className="text-muted-foreground text-[10px] line-through">
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
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">
                    {option.title}
                  </Label>
                  {option.require && (
                    <Badge
                      variant="outline"
                      className="border-primary text-primary text-[10px]"
                    >
                      * จำเป็น
                    </Badge>
                  )}
                </div>
                <RadioGroup
                  value={selectedOptions[option.title] ?? ''}
                  onValueChange={(val) => handleOptionChange(option.title, val)}
                  className="space-y-1.5"
                >
                  {option.choices.map((choice) => (
                    <Label
                      key={choice.name}
                      htmlFor={`${option.title}-${choice.name}`}
                      className={cn(
                        'has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                        currentVariantStock <= 0 &&
                          'cursor-not-allowed opacity-50',
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={choice.name}
                          id={`${option.title}-${choice.name}`}
                          disabled={currentVariantStock <= 0}
                        />
                        <span className="text-sm">{choice.name}</span>
                      </div>
                      {choice.extraPrice > 0 && (
                        <span className="text-primary font-semibold">
                          +{formatCurrency(choice.extraPrice)}
                        </span>
                      )}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            ))}
            {product.addons && product.addons.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">บริการเสริม</Label>
                <div className="space-y-1.5">
                  {product.addons.map((addon) => {
                    const isDisabled =
                      !addon.isAvailable || currentVariantStock <= 0

                    return (
                      <Label
                        key={addon.id}
                        htmlFor={addon.id}
                        className={cn(
                          'has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                          isDisabled && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={addon.id}
                            disabled={isDisabled}
                            checked={selectedAddonIds.includes(addon.id)}
                            onCheckedChange={() => handleAddonToggle(addon.id)}
                          />
                          <span className="text-sm font-medium">
                            {addon.title}
                          </span>
                        </div>
                        <span className="text-primary font-semibold">
                          +{formatCurrency(addon.price)}
                        </span>
                      </Label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={currentVariantStock > 0 ? currentVariantStock : 1}
          />
          <Button
            size="lg"
            className="w-full font-bold sm:w-auto"
            disabled={currentVariantStock <= 0}
            onClick={handleConfirmAddToCart}
          >
            {currentVariantStock <= 0
              ? 'สินค้าหมด'
              : `เพิ่มลงตะกร้า ${formatCurrency(unitPrice * quantity)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
