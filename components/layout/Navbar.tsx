'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { NAVBAR_ITEMS } from '@/constants/navbar'
import { useSession } from '@/hooks/use-session'
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
import { Separator } from '../ui/separator'
import { ListItem } from './_components/ListItem'
import { MerchantAvatarDropdown } from './_components/MerchantAvatarDropdown'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSession()

  const isEmailVerified = user && user?.isEmailVerified

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 md:px-10">
          <LogoBrand />

          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                {NAVBAR_ITEMS.map((item, idx) => (
                  <NavigationMenuItem key={idx}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="bg-transparent text-lg font-bold opacity-50">
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
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
                          'bg-transparent text-lg font-bold opacity-50 hover:bg-transparent',
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
              <Link href="/login">
                <Button variant="secondary" className="flex gap-2 font-bold">
                  <LockIcon size={18} />
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-bold">สมัครเปิดร้าน</Button>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <MerchantAvatarDropdown className="hidden lg:block" />
          )}

          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && <MerchantAvatarDropdown />}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-transparent"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'container mx-auto overflow-y-auto border-t bg-white transition-all duration-300 ease-in-out lg:hidden',
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
                    <p className="text-sm font-bold text-slate-400 uppercase">
                      {item.title}
                    </p>
                    <div className="ml-2 flex flex-col space-y-4 border-l-2 border-slate-100 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="active:text-primary text-lg font-semibold text-slate-700"
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
                    className="text-xl font-bold text-slate-700"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-4">
              <Separator />
            </div>

            {!isAuthenticated && (
              <div className="flex flex-col gap-3 pt-4 pb-10">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="secondary"
                    className="w-full justify-center gap-2 py-7 text-lg font-bold"
                  >
                    <LockIcon size={20} />
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center py-7 text-lg font-bold">
                    สมัครเปิดร้าน
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {!isEmailVerified && <EmailVerified />}
      </header>

      <div className="h-18.25 lg:h-20.25" />
    </>
  )
}
