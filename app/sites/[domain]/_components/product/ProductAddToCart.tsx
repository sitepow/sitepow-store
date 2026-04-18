import toast from 'react-hot-toast'

import { calculateUnitPrice, mapSelectedOptions } from '@/utils/cart'
import { formatNumber } from '@/utils/pricing'
import {
  calculateRewardPoints,
  validateProductRequirements,
} from '@/utils/product'
import { PackageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { useCartStore } from '../../cart/store'
import { useProductPurchaseStore } from '../../products/store'
import { QuantitySelector } from './QuantitySelector'

export function ProductAddToCart() {
  const {
    product,
    quantity,
    setQuantity,
    selectedVariant,
    selectedOptions,
    selectedAddons,
  } = useProductPurchaseStore()

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error('กรุณาเลือกรูปแบบสินค้า')
      return
    }

    const { isValid, missingOptions } = validateProductRequirements(
      product,
      selectedOptions,
    )

    if (!isValid) {
      toast.error(`กรุณาเลือก ${missingOptions.join(', ')}`)
      return
    }

    const mappedOptions = mapSelectedOptions(product, selectedOptions)
    const selectedAddonsData = product.addons.filter((addon) =>
      selectedAddons.includes(addon.addonId),
    )

    const unitPrice = calculateUnitPrice(
      selectedVariant,
      mappedOptions,
      selectedAddonsData,
    )

    addItem({
      productId: product.productId,
      productTitle: product.title,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url ||
        '',
      variant: selectedVariant,
      selectedOptions: mappedOptions,
      selectedAddons: selectedAddonsData,
      quantity: quantity,
      unitPrice: unitPrice,
      rewardPoints: calculateRewardPoints(selectedVariant, quantity), // ใช้ Utils คำนวณตรงๆ
    })
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
              <PackageIcon className="text-primary" />
              <span>{formatNumber(selectedVariant?.stock || 0)} ชิ้น</span>
            </div>
          )}
        </div>
      </div>

      <Button
        size="lg"
        className="mt-4 h-14 w-full text-lg shadow-lg"
        onClick={handleAddToCart}
      >
        เพิ่มลงตะกร้า
      </Button>
    </>
  )
}
