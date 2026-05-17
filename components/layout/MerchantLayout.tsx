import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function MerchantLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <div className="flex flex-col gap-10">
      <main className={cn(className)} {...props}>
        {children}
      </main>
    </div>
  )
}
