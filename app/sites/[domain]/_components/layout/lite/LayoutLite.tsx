import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { StoreNavbarLite } from './NavbarLite'

export function StoreLayoutLite({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <div className="flex flex-col gap-10">
      <StoreNavbarLite />

      <main className={cn(className, 'mt-20')} {...props}>
        {children}
      </main>
    </div>
  )
}
