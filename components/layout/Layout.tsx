import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function MainLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <div className="flex flex-col gap-10">
      <Navbar />
      <main className={cn(className)} {...props}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
