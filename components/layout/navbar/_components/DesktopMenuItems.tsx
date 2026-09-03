'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { NAVBAR_ITEMS } from '@/constants/navbar'
import { cleanTag } from '@/utils/format'

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import { ListItem } from '../../_components/ListItem'

export function DesktopMenuItems() {
  const tNav = useTranslations('common.navbar')
  const tFeatures = useTranslations('home.features')

  const navKeys: Array<'features' | 'pricing' | 'downloadPos' | 'contact'> = [
    'features',
    'pricing',
    'downloadPos',
    'contact',
  ]

  return (
    <>
      {NAVBAR_ITEMS.map((item, idx) => {
        const title = navKeys[idx] ? tNav(navKeys[idx]) : item.title

        return (
          <NavigationMenuItem className="mx-0.5" key={idx}>
            {item.children ? (
              <>
                <NavigationMenuTrigger className="font-bold opacity-60 hover:bg-neutral-900 focus:bg-neutral-900 data-open:bg-neutral-900/50 data-open:hover:bg-neutral-900 data-open:focus:bg-neutral-900 data-popup-open:bg-neutral-900/50 data-popup-open:hover:bg-neutral-900 2xl:text-lg">
                  {title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-100 gap-3 p-4 md:w-2xl md:grid-cols-3 2xl:w-3xl">
                    {item.children.map((child, childIdx) => {
                      const childTitle = tFeatures.raw(
                        `items.${childIdx}.title`,
                      ) as string
                      const childDesc = tFeatures.raw(
                        `items.${childIdx}.description`,
                      ) as string

                      return (
                        <ListItem
                          key={childIdx}
                          title={childTitle}
                          href={child.href}
                          icon={child.icon}
                        >
                          {cleanTag(childDesc, 'hilight')}
                        </ListItem>
                      )
                    })}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  'font-bold opacity-60 hover:bg-transparent 2xl:text-lg',
                )}
              >
                <Link href={item.href!}>{title}</Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        )
      })}
    </>
  )
}
