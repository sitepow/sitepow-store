import { formatCurrency } from '@/utils/pricing'

import { cn } from '@/lib/utils'

interface RadioCardProps {
  title: string
  description: string
  price?: number
  isSelected: boolean
  onSelect: () => void
}

export function RadioCard({
  title,
  description,
  price,
  isSelected,
  onSelect,
}: RadioCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-xl border p-4 text-start transition-all',
        isSelected
          ? 'border-primary bg-primary/5 ring-primary ring-1'
          : 'border-gray-200 bg-white hover:border-gray-300',
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={cn(
              'text-sm font-bold',
              isSelected ? 'text-primary' : 'text-gray-700',
            )}
          >
            {title} {price !== undefined && `(${formatCurrency(price)})`}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        </div>
        <div
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            isSelected ? 'border-primary' : 'border-gray-300',
          )}
        >
          {isSelected && <div className="bg-primary size-2.5 rounded-full" />}
        </div>
      </div>
    </div>
  )
}
