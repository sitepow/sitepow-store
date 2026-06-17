'use client'

import { Fragment, PropsWithChildren } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NavigationItem } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconChevronRight } from '@tabler/icons-react'

import { LogoBrand } from '@/components/LogoBrand'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { ChatWidget } from '../chat/chat-widget'
import { SupportWidget } from '../chat/support-widget'

interface DashboardSidebarProps extends PropsWithChildren {
  items: NavigationItem[]
  redirectPath: string
}

export function DashboardSidebar({
  items,
  redirectPath,
  children,
}: DashboardSidebarProps) {
  const { user } = useSession()
  const userRole = user?.role

  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="mx-auto py-5">
          <LogoBrand />
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarMenu>
            {items.map((item) => {
              const mainUrl = `/${redirectPath}/${item.value}`
              const isSubActive = item.items?.some(
                (sub) => pathname === sub.url,
              )
              const isMainActive = pathname === mainUrl || isSubActive

              return (
                <Fragment key={item.value}>
                  {item.hasSeparatorBefore && <Separator className="my-2" />}

                  {item.items && item.items.length > 0 ? (
                    <Collapsible
                      asChild
                      defaultOpen={isSubActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isSubActive}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                            <IconChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubItemActive = pathname === subItem.url
                              return (
                                <SidebarMenuSubItem key={subItem.value}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubItemActive}
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isMainActive}>
                        <Link href={mainUrl}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </Fragment>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <main className="w-full min-w-0 space-y-5 p-5">
        <SidebarTrigger />
        {children}
        {userRole === UserRole.SUPPORT && <SupportWidget />}
        {userRole !== UserRole.SUPPORT && <ChatWidget />}
      </main>
    </SidebarProvider>
  )
}
