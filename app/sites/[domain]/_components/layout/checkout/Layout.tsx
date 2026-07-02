import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { StoreNavbarCheckout } from './Navbar'

export function StoreLayoutCheckout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <div className="flex flex-col gap-10">
      <StoreNavbarCheckout />

      <main className={cn(className, 'mt-32')} {...props}>
        {children}
      </main>
    </div>
  )
}
