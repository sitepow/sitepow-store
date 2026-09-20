'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { MERCHANT_NAVIGATION, SUPPORT_NAVIGATION } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { Menu, X } from 'lucide-react'

import { EmailVerified } from '@/components/EmailVerified'
import { LogoBrand } from '@/components/LogoBrand'
import { QuickSettingsMenu } from '@/components/QuickSettingsMenu'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import { DesktopMenuItems } from './_components/DesktopMenuItems'
import { DesktopUserActions } from './_components/DesktopUserActions'
import { MobileMenuItems } from './_components/MobileMenuItems'

export function Navbar() {
  const isMounted = useIsMounted()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, userRole } = useSession()
  const isAuth = isMounted && isAuthenticated
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navbarItems = (
    [UserRole.SUPPORT, UserRole.CUSTOMER] as UserRole[]
  ).includes(userRole)
    ? SUPPORT_NAVIGATION
    : MERCHANT_NAVIGATION

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const authParams = new URLSearchParams()
  authParams.set('role', UserRole.MERCHANT)
  if (currentUrl && currentUrl !== '/') {
    authParams.set('callbackUrl', currentUrl)
  }

  const loginHref = `/login?${authParams.toString()}`
  const registerHref = `/register?${authParams.toString()}`

  const isEmailUnverified = isAuth && !user?.emailVerified

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="shrink-0">
            <LogoBrand />
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <DesktopMenuItems />
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            {!isAuth ? (
              <div className="flex items-center gap-4">
                <Link
                  href={loginHref}
                  className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                >
                  เข้าสู่ระบบ
                </Link>

                <Button
                  asChild
                  className="h-9 rounded-full bg-orange-500 px-5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-orange-600"
                >
                  <Link href={registerHref}>ทดลองใช้ฟรี</Link>
                </Button>
              </div>
            ) : (
              <DesktopUserActions
                navbarItems={navbarItems}
                userRole={userRole}
              />
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <QuickSettingsMenu buttonVariant="outline" />

            {isAuth ? (
              <UserAvatarDropdown redirectPath="merchant" items={navbarItems} />
            ) : (
              <Button
                size="sm"
                asChild
                className="h-8 rounded-full bg-orange-500 px-3.5 text-xs font-medium text-white hover:bg-orange-600"
              >
                <Link href={registerHref}>ทดลองใช้ฟรี</Link>
              </Button>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-hidden dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="เมนูหลัก"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'overflow-y-auto border-t border-neutral-200/80 bg-white transition-all duration-300 ease-in-out lg:hidden dark:border-neutral-800 dark:bg-neutral-950',
            isMenuOpen
              ? 'max-h-[calc(100vh-4rem)] opacity-100 shadow-xl'
              : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <div className="container mx-auto px-4 py-4 sm:px-6">
            <MobileMenuItems
              onClose={() => setIsMenuOpen(false)}
              isAuthenticated={isAuth}
              loginHref={loginHref}
              registerHref={registerHref}
            />
          </div>
        </div>

        {isEmailUnverified && <EmailVerified />}
      </header>

      <div className={cn('h-16', isEmailUnverified && 'h-32 lg:h-24')} />
    </>
  )
}
