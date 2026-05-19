'use client'

import { PropsWithChildren } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { BUYER_NAVIGATION } from '@/constants/navigation'

import { LogoBrand } from '@/components/LogoBrand'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export function BuyerLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="mx-auto py-5">
          <LogoBrand />
        </SidebarHeader>
        <SidebarContent>
          {BUYER_NAVIGATION.map((item) => {
            const url = `/user/${item.value}`
            const isActive = pathname === url

            return (
              <SidebarMenu key={item.value}>
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={url}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )
          })}
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <main className="w-full min-w-0 space-y-5 overflow-hidden p-5">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
