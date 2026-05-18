'use client'

import { PropsWithChildren } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'

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

export function MerchantLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="mx-auto py-5">
          <LogoBrand />
        </SidebarHeader>
        <SidebarContent>
          {MERCHANT_NAVIGATION.map((item) => {
            const url = `/merchant/${item.value}`
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
      <main className="w-full space-y-5 p-5">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
