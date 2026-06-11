import { formatCurrency } from '@/utils/pricing'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../products/store'

export function ProductOptionGroups() {
  const { product, selectedOptions, toggleOption, isLoading } =
    useProductPurchaseStore()
  const hasOptionGroups = product?.options?.length !== 0

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
        <Separator />
      </>
    )
  }

  return (
    <>
      {product?.options?.map((option, idx) => (
        <div key={idx} className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-lg font-semibold">{option.title}</Label>
            {option.require && (
              <Badge variant="outline" className="border-primary text-primary">
                * จำเป็น
              </Badge>
            )}
          </div>

          <RadioGroup
            value={selectedOptions[option.title]?.[0]}
            onValueChange={(val) => toggleOption(option.title, val, 1)}
          >
            <div className="grid grid-cols-1 gap-2">
              {option.choices.map((choice) => (
                <div
                  key={choice.name}
                  className="flex items-center space-x-3 rounded-lg border p-3"
                >
                  <RadioGroupItem value={choice.name} id={choice.name} />
                  <Label
                    htmlFor={choice.name}
                    className="flex-1 cursor-pointer"
                  >
                    {choice.name}
                  </Label>
                  {choice.extraPrice > 0 && (
                    <span className="text-primary text-sm font-semibold">
                      +{formatCurrency(choice.extraPrice)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      ))}

      {hasOptionGroups && <Separator />}
    </>
  )
}
