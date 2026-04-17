import toast from 'react-hot-toast'

import { SelectedOption } from '@/types/sites/cart'
import { formatNumber } from '@/utils/pricing'
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
    getTotalPrice,
    getCurrentPoints,
  } = useProductPurchaseStore()

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error('กรุณาเลือกตัวเลือกสินค้าให้ครบถ้วน')
      return
    }

    const mappedOptions: SelectedOption[] = []
    Object.entries(selectedOptions).forEach(([title, choices]) => {
      const optionGroup = product.options.find((o) => o.title === title)
      choices.forEach((choiceName) => {
        const choice = optionGroup?.choices.find((c) => c.name === choiceName)
        if (choice) {
          mappedOptions.push({
            optionTitle: title,
            choiceName: choiceName,
            extraPrice: choice.extraPrice,
          })
        }
      })
    })

    const selectedAddonsData = product.addons.filter((addon) =>
      selectedAddons.includes(addon.addonId),
    )

    const unitPrice = getTotalPrice() / quantity

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
      rewardPoints: getCurrentPoints(),
    })

    toast.success('เพิ่มสินค้าลงในตระกร้าสำเร็จแล้ว')
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
