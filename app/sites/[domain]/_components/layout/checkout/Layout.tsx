'use client'

import { ComponentProps } from 'react'

import { getStoreFontFamily } from '@/constants/fonts'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'

import { EmailVerified } from '@/components/EmailVerified'
import { SectionContainer } from '@/components/SectionContainer'

import { cn } from '@/lib/utils'

import { StoreNavbarCheckout } from './Navbar'

export function StoreLayoutCheckout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  const { store } = useStoreData()
  const { isAuthenticated, user } = useSession()

  const isEmailUnverified = isAuthenticated && !user?.emailVerified
  const fontVar = getStoreFontFamily(store?.fontFamily)

  return (
    <div
      className="flex flex-col gap-10"
      style={
        {
          '--primary': store?.primaryColor,
          '--font-sans': fontVar,
          fontFamily: fontVar,
        } as React.CSSProperties
      }
    >
      <StoreNavbarCheckout />
      <main className={cn(className, 'mt-24 sm:mt-20 lg:mt-24')} {...props}>
        {isEmailUnverified && (
          <SectionContainer className="py-0 sm:py-0">
            <EmailVerified />
          </SectionContainer>
        )}
        {children}
      </main>
    </div>
  )
}
