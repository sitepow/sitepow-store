import { ComponentProps } from 'react'

import { useStoreData } from '@/stores/sites/use-store-data'

import { cn } from '@/lib/utils'

import { StoreNavbarCheckout } from './Navbar'

export function StoreLayoutCheckout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  const { store } = useStoreData()

  return (
    <div
      className="flex flex-col gap-10"
      style={{ '--brand-color': store?.primaryColor } as React.CSSProperties}
    >
      <StoreNavbarCheckout />
      <main className={cn(className, 'mt-24 sm:mt-20 lg:mt-24')} {...props}>
        {children}
      </main>
    </div>
  )
}
