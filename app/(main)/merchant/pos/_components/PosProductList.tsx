'use client'

import { useMemo, useState } from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { SectionProductItem } from '@/actions/storefront/sections'
import { ProductCard } from '@/app/sites/[domain]/_components/product/ProductCard'
import { formatCurrency } from '@/utils/pricing'
import { IconMinus, IconPlus, IconSearch } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface SelectedOptionPayload {
  groupTitle: string
  choiceName: string
}

export interface SelectedAddonPayload {
  id: string
  title: string
  price: number
}

interface PosProductListProps {
  products: POSProductItem[]
  search: string
  onSearchChange: (val: string) => void
  onAddToCart: (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity?: number,
  ) => void
}

export function PosProductList({
  products,
  search,
  onSearchChange,
  onAddToCart,
}: PosProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<POSProductItem | null>(
    null,
  )

  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({})
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState<number>(1)

  const getVariantStock = (variant: POSProductItem['variants'][number]) => {
    return variant.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0)
  }

  const handleProductClick = (product: POSProductItem) => {
    const hasMultipleVariants = product.variants.length > 1
    const hasOptions = (product.options?.length ?? 0) > 0
    const hasAddons = (product.addons?.length ?? 0) > 0

    const singleVariantStock =
      product.variants.length > 0 ? getVariantStock(product.variants[0]) : 0

    if (
      !hasMultipleVariants &&
      !hasOptions &&
      !hasAddons &&
      singleVariantStock > 0
    ) {
      onAddToCart(product, product.variants[0].id)
      return
    }

    setSelectedProduct(product)
    setSelectedVariantId(product.variants[0]?.id ?? '')

    const initialOptions: Record<string, string> = {}
    product.options?.forEach((opt) => {
      if (opt.choices.length > 0) {
        initialOptions[opt.title] = opt.choices[0].name
      }
    })
    setSelectedOptions(initialOptions)
    setSelectedAddonIds([])
    setQuantity(1)
  }

  const handleCloseDialog = () => {
    setSelectedProduct(null)
    setSelectedVariantId('')
    setSelectedOptions({})
    setSelectedAddonIds([])
    setQuantity(1)
  }

  const currentVariant = useMemo(() => {
    if (!selectedProduct) return null
    return (
      selectedProduct.variants.find((v) => v.id === selectedVariantId) ||
      selectedProduct.variants[0]
    )
  }, [selectedProduct, selectedVariantId])

  const currentVariantStock = useMemo(() => {
    if (!currentVariant) return 0
    return getVariantStock(currentVariant)
  }, [currentVariant])

  const unitPrice = useMemo(() => {
    if (!selectedProduct || !currentVariant) {
      return 0
    }

    let price = Number(currentVariant.price)

    selectedProduct.options?.forEach((opt) => {
      const selectedChoiceName = selectedOptions[opt.title]
      if (selectedChoiceName) {
        const choice = opt.choices.find((c) => c.name === selectedChoiceName)
        if (choice) {
          price += choice.extraPrice
        }
      }
    })

    selectedProduct.addons?.forEach((addon) => {
      if (selectedAddonIds.includes(addon.id)) {
        price += addon.price
      }
    })

    return price
  }, [selectedProduct, currentVariant, selectedOptions, selectedAddonIds])

  const handleConfirmAddToCart = () => {
    if (!selectedProduct || !currentVariant || currentVariantStock <= 0) {
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
        const addon = selectedProduct.addons?.find((a) => a.id === id)
        if (!addon) return null
        return {
          id: addon.id,
          title: addon.title,
          price: addon.price,
        }
      })
      .filter((item): item is SelectedAddonPayload => item !== null)

    onAddToCart(
      selectedProduct,
      currentVariant.id,
      formattedOptions,
      formattedAddons,
      quantity,
    )

    handleCloseDialog()
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

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative">
        <IconSearch className="text-muted-foreground absolute top-2.5 left-3 size-4" />
        <Input
          placeholder="ค้นหาสินค้า, SKU, หรือสแกนบาร์โค้ด..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <ScrollArea>
        {products.length === 0 ? (
          <ActionRequiredAlert
            title="ขออภัยครับ"
            description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + getVariantStock(v),
                0,
              )

              return (
                <ProductCard
                  key={product.id}
                  className="text-center"
                  onClick={() => handleProductClick(product)}
                  variant="outline"
                  product={product as unknown as SectionProductItem}
                  quantity={totalStock}
                />
              )
            })}
          </div>
        )}
      </ScrollArea>
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent showCloseButton={false} className="">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              เลือกตัวเลือกสินค้า: {selectedProduct?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-6 py-2">
              {selectedProduct &&
                (selectedProduct.variants.length > 1 ||
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
                      {selectedProduct.variants.map((variant) => {
                        const stock = getVariantStock(variant)
                        const isOutOfStock = stock <= 0
                        const hasPoints =
                          variant.pointsActive &&
                          (variant.pointsAmount ?? 0) > 0

                        return (
                          <Label
                            key={variant.id}
                            htmlFor={variant.id}
                            className={`has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                              isOutOfStock ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={variant.id}
                                id={variant.id}
                              />
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {variant.title}
                                  </span>
                                  {hasPoints && (
                                    <span className="text-[10px] font-semibold text-amber-500">
                                      + {variant.pointsAmount} แต้ม
                                    </span>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-[10px]">
                                  คงเหลือ: {stock} ชิ้น
                                  {variant?.sku ? `, SKU: ${variant.sku}` : ''}
                                </span>
                              </div>
                            </div>
                            <span className="text-primary font-semibold">
                              {formatCurrency(Number(variant.price))}
                            </span>
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>
                )}
              {selectedProduct?.options?.map((option, idx) => (
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
                    onValueChange={(val) =>
                      handleOptionChange(option.title, val)
                    }
                    className="space-y-1.5"
                  >
                    {option.choices.map((choice) => (
                      <Label
                        key={choice.name}
                        htmlFor={`${option.title}-${choice.name}`}
                        className={`has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                          currentVariantStock <= 0
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }`}
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
              {selectedProduct?.addons && selectedProduct.addons.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    บริการเสริม / ท็อปปิ้ง
                  </Label>
                  <div className="space-y-1.5">
                    {selectedProduct.addons.map((addon) => {
                      const isDisabled =
                        !addon.isAvailable || currentVariantStock <= 0

                      return (
                        <Label
                          key={addon.id}
                          htmlFor={addon.id}
                          className={`has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={addon.id}
                              disabled={isDisabled}
                              checked={selectedAddonIds.includes(addon.id)}
                              onCheckedChange={() =>
                                handleAddonToggle(addon.id)
                              }
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
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                disabled={currentVariantStock <= 0}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <IconMinus className="size-4" />
              </Button>
              <span className="w-8 text-center text-lg font-bold">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                disabled={currentVariantStock <= 0}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <IconPlus className="size-4" />
              </Button>
            </div>
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
    </div>
  )
}
