import { formatCurrency, formatNumber } from '@/utils/pricing'

import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

export function ProductPriceHeader() {
  const { product, getCurrentPoints, getTotalPrice, isLoading } =
    useProductPurchaseStore()
  const totalPrice = getTotalPrice()
  const points = getCurrentPoints()

  return (
    <header className="flex flex-col gap-4">
      {isLoading ? (
        <Skeleton className="h-10 w-3/4 rounded-lg" />
      ) : (
        <h1
          itemProp="name"
          className="text-start text-xl leading-tight font-bold sm:text-2xl lg:text-3xl"
        >
          {product?.title}
        </h1>
      )}

      <div
        itemProp="offers"
        itemScope
        itemType="https://schema.org/Offer"
        className="flex flex-col gap-2.5"
      >
        <meta itemProp="priceCurrency" content="THB" />
        <link
          itemProp="availability"
          href="https://schema.org/InStock"
        />
        {isLoading ? (
          <Skeleton className="h-12 w-36 rounded-lg" />
        ) : (
          <>
            <Label className="text-muted-foreground text-sm font-semibold">
              ราคาสินค้า
            </Label>
            <div className="flex items-end gap-2">
              <data
                itemProp="price"
                value={totalPrice || 0}
                className="text-primary text-4xl font-bold sm:text-5xl"
              >
                {formatCurrency(totalPrice || 0)}
              </data>
            </div>

            {points > 0 && (
              <p className="text-muted-foreground text-sm">
                คุณจะได้รับ{' '}
                <span className="text-primary text-lg font-bold">
                  {formatNumber(points)}
                </span>{' '}
                แต้มสะสม
              </p>
            )}
          </>
        )}
      </div>

      <Separator />
    </header>
  )
}
