import { formatCurrency } from '@/utils/pricing'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../products/store'

export function ProductAddonSelector() {
  const { product, selectedAddons, toggleAddon, isLoading } =
    useProductPurchaseStore()
  const hasAddons = product?.addons?.length !== 0

  if (isLoading) {
    return (
      <>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <Separator />
      </>
    )
  }

  return (
    <>
      {product?.addons && product.addons.length > 0 && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold">บริการเสริม</Label>
          <div className="space-y-2">
            {product?.addons?.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center space-x-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={addon.id}
                  disabled={!addon.isAvailable}
                  checked={selectedAddons.includes(addon.id)}
                  onCheckedChange={() => toggleAddon(addon.id)}
                />
                <Label
                  htmlFor={addon.id}
                  className="flex-1 cursor-pointer text-sm font-medium"
                >
                  {addon.title}
                </Label>
                <span className="text-sm font-semibold">
                  +{formatCurrency(addon.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasAddons && <Separator />}
    </>
  )
}
