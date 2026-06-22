'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { NAVBAR_ITEMS } from '@/constants/navbar'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { getClientAuthUrl } from '@/utils/auth'
import { IconLock } from '@tabler/icons-react'
import { LockIcon, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import { EmailVerified } from '../EmailVerified'
import { LogoBrand } from '../LogoBrand'
import { ModeToggle } from '../ModeToggle'
import { Separator } from '../ui/separator'
import { ListItem } from './_components/ListItem'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSession()
  const isMounted = useIsMounted()

  const loginHref = isMounted
    ? getClientAuthUrl({ path: 'login', role: UserRole.MERCHANT })
    : '#'
  const registerHref = isMounted
    ? getClientAuthUrl({ path: 'register', role: UserRole.MERCHANT })
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
      <header className="fixed top-0 left-0 z-50 w-full bg-neutral-900">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/images/navigation/navigation-header.jpeg"
            alt="footer-background"
            width={800}
            height={800}
            className="h-full w-full object-cover opacity-40"
          />
        </div>

        <div className="container mx-auto flex items-center justify-between px-6 py-4 md:px-10">
          <LogoBrand className="text-white" />

          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList className="text-white">
                {NAVBAR_ITEMS.map((item, idx) => (
                  <NavigationMenuItem key={idx}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="text-lg font-bold opacity-60 hover:bg-neutral-900 focus:bg-neutral-900 data-open:bg-neutral-900/50 data-open:hover:bg-neutral-900 data-open:focus:bg-neutral-900 data-popup-open:bg-neutral-900/50 data-popup-open:hover:bg-neutral-900">
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-100 gap-3 p-4 md:w-2xl md:grid-cols-3 lg:w-3xl">
                            {item.children.map(({ description, ...rest }) => (
                              <ListItem key={rest.title} {...rest}>
                                {description}
                              </ListItem>
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

          {!isAuthenticated && (
            <div className="hidden items-center gap-4 lg:flex">
              <Link href={loginHref}>
                <Button variant="secondary" className="flex gap-2 font-bold">
                  <LockIcon size={18} />
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href={registerHref}>
                <Button className="font-bold">สมัครเปิดร้าน</Button>
              </Link>
              <ModeToggle buttonVariant="secondary" />
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden items-center gap-4 lg:flex">
              <UserAvatarDropdown
                redirectPath="merchant"
                items={MERCHANT_NAVIGATION}
                className="hidden lg:block"
              />
              <Button
                variant="secondary"
                className="flex gap-2 font-bold"
                asChild
              >
                <Link href="/merchant/dashboard" target="_blank">
                  <IconLock />
                  จัดการร้านค้าของคุณ
                </Link>
              </Button>
              <ModeToggle buttonVariant="secondary" />
            </div>
          )}

          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && (
              <UserAvatarDropdown
                redirectPath="merchant"
                items={MERCHANT_NAVIGATION}
              />
            )}

            <div className="flex flex-wrap gap-2">
              <ModeToggle buttonVariant="secondary" />
              <Button
                variant="secondary"
                size="icon-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:bg-transparent"
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
          <div className="flex flex-col space-y-4 px-6 py-8">
            {NAVBAR_ITEMS.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                {item.children ? (
                  <div className="space-y-4">
                    <p className="text-sm font-bold opacity-40">{item.title}</p>
                    <div className="border-border ml-2 flex flex-col space-y-4 border-l-2 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="active:text-primary text-lg font-semibold opacity-80"
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
                    className="text-foreground text-xl font-bold"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}

            {!isAuthenticated && (
              <>
                <div className="pt-4">
                  <Separator />
                </div>

                <div className="flex flex-col gap-3 pt-4 pb-10">
                  <Link href={loginHref} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full justify-center gap-2 py-7 text-lg font-bold"
                    >
                      <LockIcon size={20} />
                      เข้าสู่ระบบ
                    </Button>
                  </Link>
                  <Link
                    href={registerHref}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full justify-center py-7 text-lg font-bold">
                      สมัครเปิดร้าน
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
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
