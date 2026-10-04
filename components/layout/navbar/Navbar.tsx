'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/shared/UserAvatarDropdown'
import { MERCHANT_NAVIGATION, SUPPORT_NAVIGATION } from '@/constants/store/navigation'
import { FALLBACK_IMAGE } from '@/constants/system'
import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconLogin } from '@tabler/icons-react'
import { Menu, X } from 'lucide-react'

import { EmailVerified } from '@/components/auth/EmailVerified'
import { LogoBrand } from '@/components/brand/LogoBrand'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import { DesktopGuestActions } from './_components/DesktopGuestActions'
import { DesktopMenuItems } from './_components/DesktopMenuItems'
import { DesktopUserActions } from './_components/DesktopUserActions'
import { MobileMenuItems } from './_components/MobileMenuItems'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, userRole } = useSession()
  const pathname = usePathname()

  const navbarItems = (
    [UserRole.SUPPORT, UserRole.CUSTOMER] as UserRole[]
  ).includes(userRole)
    ? SUPPORT_NAVIGATION
    : MERCHANT_NAVIGATION

  const initialAuthParams = new URLSearchParams()
  initialAuthParams.set('role', UserRole.MERCHANT)
  if (pathname && pathname !== '/') {
    initialAuthParams.set('callbackUrl', pathname)
  }

  const [loginHref, setLoginHref] = useState(`/login?${initialAuthParams.toString()}`)
  const [registerHref, setRegisterHref] = useState(`/register?${initialAuthParams.toString()}`)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search
      const fullUrl = `${pathname}${search}`
      if (fullUrl && fullUrl !== '/') {
        const params = new URLSearchParams()
        params.set('role', UserRole.MERCHANT)
        params.set('callbackUrl', fullUrl)
        setLoginHref(`/login?${params.toString()}`)
        setRegisterHref(`/register?${params.toString()}`)
      }
    }
  }, [pathname])

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
      <header className="fixed top-0 left-0 z-50 w-full bg-neutral-900">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={FALLBACK_IMAGE}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="size-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto flex items-center justify-between px-6 py-4 md:px-10">
          <LogoBrand className="text-white" />
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList className="text-white">
                <DesktopMenuItems />
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {!isAuthenticated && (
            <div className="hidden items-center gap-2.5 lg:flex">
              <DesktopGuestActions
                loginHref={loginHref}
                registerHref={registerHref}
              />
            </div>
          )}
          {isAuthenticated && (
            <div className="hidden items-center gap-4 lg:flex">
              <DesktopUserActions
                navbarItems={navbarItems}
                userRole={userRole}
              />
            </div>
          )}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && (
              <UserAvatarDropdown redirectPath="merchant" items={navbarItems} />
            )}
            <div className="flex flex-wrap gap-2">
              {!isAuthenticated && (
                <Button size="icon-lg" variant="secondary" asChild>
                  <Link href={loginHref} aria-label="เข้าสู่ระบบ">
                    <IconLogin className="size-[1.2rem]" />
                  </Link>
                </Button>
              )}
              <ThemeSwitcher buttonVariant="secondary" />
              <Button
                variant="secondary"
                size="icon-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:bg-transparent"
                aria-label={isMenuOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </Button>
            </div>
          </div>
        </div>
        <div
          className={cn(
            'bg-background text-foreground container mx-auto overflow-y-auto border-t transition-all duration-300 ease-in-out lg:hidden',
            isMenuOpen
              ? 'max-h-[calc(100vh-80px)] opacity-100'
              : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <MobileMenuItems
            onClose={() => setIsMenuOpen(false)}
            isAuthenticated={isAuthenticated}
            loginHref={loginHref}
            registerHref={registerHref}
          />
        </div>
        {isEmailUnverified && <EmailVerified />}
      </header>
      <div
        className={cn(
          'h-18.25 lg:h-20.25',
          isEmailUnverified && 'h-35 lg:h-26.25',
        )}
      />
    </>
  )
}
