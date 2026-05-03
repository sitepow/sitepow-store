'use client'

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

const SIDEBAR_ITEMS = [
  {
    category: 'จัดการร้านค้า',
    items: [
      {
        title: 'แดชบอร์ด',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    category: 'สินค้า',
    items: [
      {
        title: 'เพิ่มสินค้าใหม่',
        url: '/admin/products/new',
        icon: PlusCircle,
      },
      {
        title: 'รายการสินค้า',
        url: '/admin/products',
        icon: Package,
      },
    ],
  },
  {
    category: 'ตั้งค่า',
    items: [
      {
        title: 'ตั้งค่าร้านค้า',
        url: '/admin/settings',
        icon: Settings,
      },
    ],
  },
]

export function StoreAdminAppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="mx-auto py-5">
        <LogoBrand />
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_ITEMS.map((group) => (
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
