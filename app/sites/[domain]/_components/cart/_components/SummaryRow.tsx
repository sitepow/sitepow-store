import { cn } from '@/lib/utils'

export function SummaryRow({
  label,
  value,
  isDiscount = false,
}: {
  label: string
  value: React.ReactNode
  isDiscount?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between text-sm',
        isDiscount && 'text-primary',
      )}
    >
      <span className={'text-muted-foreground'}>{label}</span>
      <span>
        {isDiscount && (typeof value === 'string' || typeof value === 'number')
          ? `- ${value}`
          : value}
      </span>
    </div>
  )
}
