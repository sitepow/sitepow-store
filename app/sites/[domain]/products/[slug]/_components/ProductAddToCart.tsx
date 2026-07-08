import toast from 'react-hot-toast'

import { formatNumber } from '@/utils/pricing'
import { calculateNetPrice } from '@/utils/product'
import { PackageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { useCartStore } from '../../../cart/store'
import { useProductPurchaseStore } from '../../store'
import { QuantitySelector } from './QuantitySelector'

export function ProductAddToCart() {
  const {
    product,
    quantity,
    setQuantity,
    selectedVariant,
    selectedOptions,
    selectedAddons,
    isLoading,
  } = useProductPurchaseStore()

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error('กรุณาเลือกรูปแบบสินค้า')
      return
    }

    const missingOptions: string[] = []
    product.options?.forEach((option) => {
      if (
        option.require &&
        (selectedOptions[option.title] ?? []).length === 0
      ) {
        missingOptions.push(option.title)
      }
    })

    if (missingOptions.length > 0) {
      toast.error(`กรุณาเลือก ${missingOptions.join(', ')}`)
      return
    }

    const mappedOptions = Object.entries(selectedOptions).flatMap(
      ([title, choices]) => {
        const optionGroup = product.options?.find((o) => o.title === title)
        return choices.map((choiceName) => {
          const choice = optionGroup?.choices.find((c) => c.name === choiceName)
          return {
            optionTitle: title,
            choiceName,
            extraPrice: choice?.extraPrice ?? 0,
          }
        })
      },
    )

    const selectedAddonsData =
      product.addons?.filter((addon) => selectedAddons.includes(addon.id)) ?? []

    let unitPrice = calculateNetPrice({
      price: selectedVariant.price,
      discount: selectedVariant.discountActive
        ? {
            active: true,
            type: selectedVariant.discountType ?? '',
            amount: selectedVariant.discountAmount ?? 0,
          }
        : undefined,
    })
    mappedOptions.forEach((o) => {
      unitPrice += o.extraPrice
    })
    selectedAddonsData.forEach((a) => {
      if (a.isAvailable) unitPrice += a.price
    })

    addItem({
      productId: product.id,
      productTitle: product.title,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url ||
        '',
      variant: selectedVariant,
      selectedOptions: mappedOptions,
      selectedAddons: selectedAddonsData,
      quantity,
      unitPrice,
      rewardPoints: selectedVariant.pointsActive
        ? selectedVariant.pointsAmount * quantity
        : 0,
    })
  }

  const stock =
    selectedVariant?.stocks.reduce((sum, s) => sum + s.quantity, 0) ?? 0

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-14 w-full rounded-lg" />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 font-bold">
        <Label className="text-lg font-semibold">จำนวน</Label>
        <div className="flex items-center gap-5">
          <QuantitySelector
            value={quantity}
            onChange={(val) => setQuantity(val)}
          />
          {selectedVariant && (
            <div className="flex gap-2.5">
              <PackageIcon className="text-(--brand-color)" />
              <span>{formatNumber(stock)} ชิ้น</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-lg font-semibold">ข้อมูลเพิ่มเติม (ถ้ามี)</Label>
        <Textarea
          placeholder="กรอกข้อความถึงผู้ขายที่นี่"
          className="min-h-20"
        />
      </div>
      <Button
        size="lg"
        variant="brand"
        className="mt-4 h-14 w-full text-lg shadow-lg"
        onClick={handleAddToCart}
      >
        เพิ่มลงตะกร้า
      </Button>
    </>
  )
}
