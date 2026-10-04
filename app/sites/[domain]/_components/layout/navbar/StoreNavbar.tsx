'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { BUYER_NAVIGATION } from '@/constants/store/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { LockKeyholeIcon, Menu, X } from 'lucide-react'

import { EmailVerified } from '@/components/auth/EmailVerified'
import { LogoBrandText } from '@/components/brand/LogoBrandText'
import { QuickSettingsMenu } from '@/components/shared/QuickSettingsMenu'
import { StoreLogo } from '@/components/brand/StoreLogo'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import { CategoryDropdown } from '../../category/CategoryDropdown'
import { UserAvatarDropdown } from '../../shared/UserAvatarDropdown'
import { CartDrawer } from '../../cart/CartDrawer'
import { StoreHeaderBackground } from './_components/StoreHeaderBackground'
import { StoreMenuItems } from './_components/StoreMenuItems'
import { StoreMobileMenu } from './_components/StoreMobileMenu'
import { StoreSearchInput } from './_components/StoreSearchInput'

export function StoreNavbar() {
  const { store } = useStoreData()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const loginParams = new URLSearchParams()
  loginParams.set('role', UserRole.CUSTOMER)
  if (currentUrl && currentUrl !== '/') {
    loginParams.set('callbackUrl', currentUrl)
  }

  const loginHref = `/login?${loginParams.toString()}`

  const isEmailUnverified = isAuthenticated && !user?.emailVerified

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      <header
        role="banner"
        className="text-foreground fixed z-50 w-full bg-neutral-900"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <StoreHeaderBackground coverImage={store?.coverImage} />
        <nav
          aria-label="แถบเมนูหลักของร้านค้า (Main Navigation)"
          className="container mx-auto flex flex-col gap-5 px-6 py-5 md:px-10"
        >
          <div className="flex items-center justify-between gap-4">
            {store?.logo ? (
              <StoreLogo image={store?.logo} />
            ) : (
              <LogoBrandText className="text-white" />
            )}
            <div className="flex items-center gap-2">
              <div className="hidden max-w-md flex-1 lg:flex">
                <StoreSearchInput />
              </div>
              {!isAuthenticated && (
                <Link href={loginHref} className="hidden lg:block">
                  <Button variant="secondary" size="lg">
                    <LockKeyholeIcon className="mr-2" />
                    เข้าสู่ระบบ
                  </Button>
                </Link>
              )}
              {isAuthenticated && (
                <UserAvatarDropdown
                  redirectPath="user"
                  items={BUYER_NAVIGATION}
                />
              )}
              <QuickSettingsMenu buttonVariant="secondary" />
              {/* <ModeToggle buttonVariant="secondary" /> */}
              <CartDrawer />
              <Button
                variant="secondary"
                size="icon-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
                aria-label={isMenuOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isMenuOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="hidden items-center justify-between lg:flex">
            <CategoryDropdown storeSlug={store?.slug} />
            <NavigationMenu>
              <NavigationMenuList className="text-white">
                <StoreMenuItems />
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>
        <div
          id="mobile-navigation-menu"
          aria-hidden={!isMenuOpen}
          className={cn(
            'bg-background absolute top-18.25 left-0 w-full overflow-y-auto border-t shadow-lg transition-all duration-300 ease-in-out lg:hidden',
            isMenuOpen
              ? 'max-h-[calc(100vh-73px)] opacity-100'
              : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <StoreMobileMenu
            storeSlug={store?.slug}
            isAuthenticated={isAuthenticated}
            loginHref={loginHref}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
        {isEmailUnverified && <EmailVerified />}
      </header>
      {isEmailUnverified && <div className="h-10" />}
    </>
  )
}
