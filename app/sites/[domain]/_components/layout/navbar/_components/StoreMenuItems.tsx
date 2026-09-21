import Link from 'next/link'

import { STORE_NAVBAR_ITEMS } from '@/constants/sites/navbar'

import { ListItem } from '@/components/layout/_components/ListItem'
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

export function StoreMenuItems() {
  return (
    <>
      {STORE_NAVBAR_ITEMS.map((item, idx) => (
        <NavigationMenuItem key={idx}>
          {item.children ? (
            <>
              <NavigationMenuTrigger className="text-lg font-bold opacity-60 hover:bg-neutral-900 focus:bg-neutral-900 data-open:bg-neutral-900/50 data-open:hover:bg-neutral-900 data-open:focus:bg-neutral-900 data-popup-open:bg-neutral-900/50 data-popup-open:hover:bg-neutral-900">
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
                'bg-transparent text-lg font-bold text-white opacity-60 hover:bg-transparent',
              )}
            >
              <Link href={item.href!}>{item.title}</Link>
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      ))}
    </>
  )
}
