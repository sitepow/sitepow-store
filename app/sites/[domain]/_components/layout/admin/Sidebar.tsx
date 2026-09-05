'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LayoutDashboard, Package, PlusCircle, Settings } from 'lucide-react'

import { LogoBrand } from '@/components/LogoBrand'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function StoreAdminAppSidebar() {
  const pathname = usePathname()
  const t = useTranslations('storefront.adminSidebar')

  const sidebarItems = [
    {
      category: t('storeManagement'),
      items: [
        {
          title: t('dashboard'),
          url: '/admin/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      category: t('products'),
      items: [
        {
          title: t('addProduct'),
          url: '/admin/products/new',
          icon: PlusCircle,
        },
        {
          title: t('productList'),
          url: '/admin/products',
          icon: Package,
        },
      ],
    },
    {
      category: t('settings'),
      items: [
        {
          title: t('storeSettings'),
          url: '/admin/settings',
          icon: Settings,
        },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="mx-auto py-5">
        <LogoBrand />
      </SidebarHeader>
      <SidebarContent>
        {sidebarItems.map((group) => (
          <SidebarGroup key={group.category}>
            <SidebarGroupLabel>{group.category}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
