import { ComponentProps } from 'react'

import { useStoreData } from '@/stores/sites/use-store-data'

import { cn } from '@/lib/utils'

interface SummaryRowProps extends ComponentProps<'div'> {
  label: string
  value: React.ReactNode
  isDiscount?: boolean
}

export function SummaryRow({
  label,
  value,
  isDiscount = false,
  className,
  ...props
}: SummaryRowProps) {
  const { store } = useStoreData()

  return (
    <div
      className={cn(
        'flex items-center justify-between text-sm',
        isDiscount && 'text-primary',
        className,
      )}
      {...props}
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <span className="opacity-60">{label}</span>
      <span>
        {isDiscount && (typeof value === 'string' || typeof value === 'number')
          ? `- ${value}`
          : value}
      </span>
    </div>
  )
}
