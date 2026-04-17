import { formatCurrency } from '@/utils/pricing'

import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { useProductPurchaseStore } from '../../products/store'

export function ProductPriceHeader() {
  const { product, getCurrentPoints, getTotalPrice } = useProductPurchaseStore()
  const totalPrice = getTotalPrice()
  const points = getCurrentPoints()

  return (
    <>
      <h1 className="text-start text-4xl leading-tight font-bold">
        {product?.title}
      </h1>

      <div className="flex flex-col gap-2.5">
        <Label className="text-lg font-semibold">ราคาสินค้า</Label>

        <div className="flex items-end gap-2">
          <data value={totalPrice} className="text-5xl font-bold">
            {formatCurrency(totalPrice || 0)}
          </data>
          <span className="mb-0.5 text-xl font-bold">THB</span>
        </div>

        {points > 0 && (
          <p>
            คุณจะได้รับ{' '}
            <span className="text-primary text-lg font-bold">{points}</span>{' '}
            แต้มสะสม
          </p>
        )}
      </div>

      <Separator />
    </>
  )
}
