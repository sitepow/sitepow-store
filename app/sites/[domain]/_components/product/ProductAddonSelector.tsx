import { formatCurrency } from '@/utils/pricing'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { useProductPurchaseStore } from '../../products/store'

export function ProductAddonSelector() {
  const { product, selectedAddons, toggleAddon } = useProductPurchaseStore()
  const hasAddons = product?.addons?.length !== 0

  return (
    <>
      {product?.addons && product.addons.length > 0 && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold">บริการเสริม</Label>
          <div className="space-y-2">
            {product?.addons?.map((addon) => (
              <div
                key={addon.addonId}
                className="flex items-center space-x-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={addon.addonId}
                  disabled={!addon.isAvailable}
                  checked={selectedAddons.includes(addon.addonId)}
                  onCheckedChange={() => toggleAddon(addon.addonId)}
                />
                <Label
                  htmlFor={addon.addonId}
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
