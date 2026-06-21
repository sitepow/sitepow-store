'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { STORE_NAVBAR_ITEMS } from '@/constants/sites/navbar'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { getClientAuthUrl } from '@/utils/auth'
import {
  ChevronDownIcon,
  LockKeyholeIcon,
  Menu,
  SearchIcon,
  X,
} from 'lucide-react'

import { EmailVerified } from '@/components/EmailVerified'
import { LogoBrand } from '@/components/LogoBrand'
import { ModeToggle } from '@/components/ModeToggle'
import { ListItem } from '@/components/layout/_components/ListItem'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

import { UserAvatarDropdown } from '../UserAvatarDropdown'
import { CartDrawer } from '../cart/CartDrawer'

export function StoreNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSession()
  const isMounted = useIsMounted()

  const loginHref = isMounted
    ? getClientAuthUrl({ path: 'login', role: UserRole.CUSTOMER })
    : '#'

  const isEmailUnverified = isAuthenticated && !user?.isEmailVerified

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="border-border text-foreground bg-background fixed z-50 w-full border-b">
        <nav className="container mx-auto flex flex-col gap-5 px-6 py-5 md:px-10">
          <div className="flex items-center justify-between gap-4">
            <LogoBrand />

            <div className="flex items-center gap-2.5 md:gap-5">
              <div className="mx-5 hidden max-w-md flex-1 lg:flex">
                <ButtonGroup className="w-full">
                  <Input id="input-button-group" placeholder="ค้นหา" />
                  <Button variant="outline">
                    <SearchIcon />
                  </Button>
                </ButtonGroup>
              </div>

              {!isAuthenticated && (
                <Link
                  href={loginHref}
                  suppressHydrationWarning
                  className="hidden lg:block"
                >
                  <Button variant="outline" size="lg">
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

              <ModeToggle />
              <CartDrawer />

              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
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
            <Button variant="outline">
              <span>หมวดหมู่สินค้า</span>
              <ChevronDownIcon />
            </Button>

            <NavigationMenu>
              <NavigationMenuList>
                {STORE_NAVBAR_ITEMS.map((item, idx) => (
                  <NavigationMenuItem key={idx}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="text-lg font-bold opacity-60">
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-72 gap-3 p-4">
                            {item.children.map((child) => (
                              <ListItem key={child.title} {...child} />
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        asChild
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'bg-transparent text-lg font-bold opacity-60 hover:bg-transparent',
                        )}
                      >
                        <Link href={item.href!}>{item.title}</Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>

        <div
          className={cn(
            'bg-background absolute top-18.25 left-0 w-full overflow-y-auto border-t shadow-lg transition-all duration-300 ease-in-out lg:hidden',
            isMenuOpen
              ? 'max-h-[calc(100vh-73px)] opacity-100'
              : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <div className="flex flex-col space-y-6 px-6 py-8 pb-20">
            <ButtonGroup className="w-full">
              <Input placeholder="ค้นหาสินค้าที่ต้องการ..." className="h-12" />
              <Button variant="outline" className="h-12">
                <SearchIcon size={18} />
              </Button>
            </ButtonGroup>

            <Button
              variant="secondary"
              className="w-full justify-between py-7 text-lg font-bold"
            >
              <span>หมวดหมู่สินค้า</span>
              <ChevronDownIcon />
            </Button>

            <Separator />

            <div className="flex flex-col space-y-5">
              {STORE_NAVBAR_ITEMS.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  {item.children ? (
                    <div className="space-y-4">
                      <p className="text-sm font-bold opacity-40">
                        {item.title}
                      </p>
                      <div className="border-border ml-2 flex flex-col space-y-4 border-l-2 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.title}
                            href={child.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="active:text-primary text-lg font-semibold opacity-80 transition-colors"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-xl font-bold"
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {!isAuthenticated && (
              <>
                <Separator />
                <Link href={loginHref} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full gap-3 border-2 py-8 text-lg font-bold"
                  >
                    <LockKeyholeIcon size={22} />
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {isEmailUnverified && <EmailVerified />}
      </header>
      {isEmailUnverified && <div className="h-10" />}
    </>
  )
}
