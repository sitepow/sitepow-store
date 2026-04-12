import Link from 'next/link'

import { NAVBAR_ITEMS } from '@/constants/navbar'

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

import { ListItem } from './ListItem'

export function Navbar() {
  return (
    <nav className="container mx-auto flex items-center justify-between px-10 py-5">
      <NavigationMenu>
        <NavigationMenuList>
          {NAVBAR_ITEMS.map((item, idx) => (
            <NavigationMenuItem key={idx}>
              {item.children ? (
                <>
                  <NavigationMenuTrigger className="text-lg font-bold opacity-50">
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                      {item.children.map((child) => (
                        <ListItem
                          key={child.href}
                          title={child.title}
                          href={child.href}
                        >
                          {child.description}
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

      <div className="flex gap-5">
        <Link href={'/login'}>
          <Button variant="ghost" size="lg">
            เข้าสู่ระบบ
          </Button>
        </Link>
        <Link href={'/register'}>
          <Button size="lg">สมัครเปิดร้าน</Button>
        </Link>
      </div>
    </nav>
  )
}
