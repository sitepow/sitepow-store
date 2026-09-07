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
                <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground font-medium transition-colors">
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
                    <li className="border-border/60 col-span-3 border-t pt-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/features"
                          className="bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                        >
                          <span>
                            {tNav("allFeaturesOverview")}
                          </span>
                          <span>→</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  'text-muted-foreground hover:text-foreground font-medium transition-colors',
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
