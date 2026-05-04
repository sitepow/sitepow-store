import { ComponentProps } from 'react'
import { Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'

import { StoreFooter } from './Footer'
import { StoreNavbar } from './Navbar'

export function StoreLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <div className="flex flex-col gap-10">
      <StoreNavbar />

      <Toaster />
      <main className={cn(className, 'mt-20 lg:mt-30')} {...props}>
        {children}
      </main>
      <StoreFooter />
    </div>
  )
}
