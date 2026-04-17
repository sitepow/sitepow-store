import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { useProductPurchaseStore } from '../../products/store'
import { QuantitySelector } from './QuantitySelector'

export function ProductAddToCart() {
  const { quantity, setQuantity } = useProductPurchaseStore()

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <Label className="text-lg font-semibold">จำนวน</Label>
        <QuantitySelector
          value={quantity}
          onChange={(val) => setQuantity(val)}
        />
      </div>
      <Button size="lg" className="mt-4 h-14 w-full text-lg shadow-lg">
        เพิ่มลงตะกร้า
      </Button>
    </>
  )
}
