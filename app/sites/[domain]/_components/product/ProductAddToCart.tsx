import { formatNumber } from '@/utils/pricing'
import { PackageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { useProductPurchaseStore } from '../../products/store'
import { QuantitySelector } from './QuantitySelector'

export function ProductAddToCart() {
  const { quantity, setQuantity, selectedVariant } = useProductPurchaseStore()

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

      <Button size="lg" className="mt-4 h-14 w-full text-lg shadow-lg">
        เพิ่มลงตะกร้า
      </Button>
    </>
  )
}
