import toast from 'react-hot-toast'

import { ProductType } from '@/generated/prisma/enums'
import {
  calculateCartUnitPrice,
  calculateRewardPoints,
  mapSelectedOptions,
  validateRequiredOptions,
} from '@/utils/cart/cart-calculation'
import { formatNumber } from '@/utils/formatting/number'
import { getStockQuantity } from '@/utils/product/product-calculation'
import { PackageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { useCartStore } from '@/stores/cart/use-cart-store'
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
    selectedBranchId,
    selectedBranchName,
  } = useProductPurchaseStore()

  const addItem = useCartStore((state) => state.addItem)
  const isPhysical = product?.productType === ProductType.PHYSICAL
  const isDigitalItem = product?.productType === ProductType.DIGITAL_ITEM
  const stock = selectedVariant
    ? getStockQuantity(
        selectedVariant,
        product?.productType ?? ProductType.PHYSICAL,
        selectedBranchId,
      )
    : 0

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error('กรุณาเลือกรูปแบบสินค้า')
      return
    }

    const missingOptions = validateRequiredOptions({
      options: product.options,
      selectedOptionsMap: selectedOptions,
    })

    if (missingOptions.length > 0) {
      toast.error(`กรุณาเลือก ${missingOptions.join(', ')}`)
      return
    }

    const mappedOptions = mapSelectedOptions(
      product.options ?? [],
      selectedOptions,
    )

    const selectedAddonsData =
      product.addons?.filter((addon) => selectedAddons.includes(addon.id)) ?? []

    const unitPrice = calculateCartUnitPrice({
      variant: selectedVariant,
      options: product.options,
      selectedOptionsMap: selectedOptions,
      addons: product.addons,
      selectedAddonIds: selectedAddons,
    })

    const rewardPoints = calculateRewardPoints({
      variant: selectedVariant,
      quantity,
    })

    const itemImage =
      (selectedVariant.image && selectedVariant.image.trim() !== ''
        ? selectedVariant.image
        : null) ||
      product.images?.find((img) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      ''

    addItem({
      productId: product.id,
      productTitle: product.title,
      branchId: selectedBranchId ?? '',
      branchName: selectedBranchName ?? '',
      weight: selectedVariant.weight || 0,
      image: itemImage,
      variant: selectedVariant,
      selectedOptions: mappedOptions,
      selectedAddons: selectedAddonsData,
      quantity,
      unitPrice,
      rewardPoints,
      productType: product?.productType ?? ProductType.PHYSICAL,
    })
  }

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
          {(isPhysical || isDigitalItem) && (
            <div className="flex gap-2.5">
              <PackageIcon className="text-primary" aria-hidden="true" />
              <span aria-label={`มีสินค้าในสต็อก ${formatNumber(stock)} ชิ้น`}>
                {formatNumber(stock)} ชิ้น
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-lg font-semibold">ข้อมูลเพิ่มเติม (ถ้ามี)</Label>
        <Textarea
          placeholder="กรอกข้อความถึงผู้ขายที่นี่"
          aria-label="ข้อความเพิ่มเติมถึงผู้ขาย"
          className="min-h-20"
        />
      </div>
      <Button
        size="lg"
        aria-label="หยิบสินค้าใส่ตะกร้า"
        className="mt-4 h-14 w-full text-lg shadow-lg"
        onClick={handleAddToCart}
      >
        เพิ่มลงตะกร้า
      </Button>
    </>
  )
}
