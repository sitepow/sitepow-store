import { ComponentProps } from 'react'

import { BASE_CREDIT_VALUE_THB } from '@/constants/ai'
import { IconInfoCircle } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

export function CreditBadge({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-primary/20 bg-primary/5 text-primary flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs',
        className,
      )}
      {...props}
    >
      <IconInfoCircle size={14} />
      <span className="font-medium">
        1 เครดิต = {BASE_CREDIT_VALUE_THB} บาท
      </span>
    </div>
  )
}
