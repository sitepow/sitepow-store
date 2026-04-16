import Link from 'next/link'

import { STORE_NAVBAR_ITEMS } from '@/constants/sites/navbar'
import {
  ChevronDownIcon,
  LockIcon,
  SearchIcon,
  ShoppingCartIcon,
} from 'lucide-react'

import { LogoBrand } from '@/components/LogoBrand'
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

import { cn } from '@/lib/utils'

export function StoreNavbar() {
  return (
    <nav className="container mx-auto flex flex-col gap-5 border-b border-gray-100 px-10 py-5">
      <div className="flex items-center justify-between">
        <LogoBrand />

        <div className="flex gap-5">
          <ButtonGroup>
            <Input id="input-button-group" placeholder="ค้นหา" />
            <Button variant="outline">
              <SearchIcon />
            </Button>
          </ButtonGroup>
          <Link href={'/login'}>
            <Button variant="outline" size="lg">
              <LockIcon />
            </Button>
          </Link>
          <Link href={'/cart'}>
            <Button variant="outline" size="lg">
              <ShoppingCartIcon />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex gap-2.5 text-lg font-bold opacity-50"
        >
          <span>หมวดหมู่สินค้า</span>
          <ChevronDownIcon />
        </Button>

        <NavigationMenu>
          <NavigationMenuList>
            {STORE_NAVBAR_ITEMS.map((item, idx) => (
              <NavigationMenuItem key={idx}>
                {item.children ? (
                  <>
                    <NavigationMenuTrigger className="text-lg font-bold opacity-50">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-72 gap-3 p-4">
                        {item.children.map((item) => (
                          <ListItem key={item.title} {...item} />
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
    </nav>
  )
}
