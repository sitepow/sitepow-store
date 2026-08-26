'use client'

import { Fragment, PropsWithChildren, useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLoyaltySettings } from '@/actions/hooks/loyalty'
import { useStoreOptions } from '@/actions/hooks/store'
import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { NavigationItem } from '@/constants/navigation'
import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconChevronRight } from '@tabler/icons-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar as RootSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
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

import { CreditBadge } from '../CreditBadge'
import { DateTimeBadge } from '../DateTimeBadge'
import { EmailVerified } from '../EmailVerified'
import { LogoBrand } from '../LogoBrand'
import { LogoBrandText } from '../LogoBrandText'
import { QuickSettingsMenu } from '../QuickSettingsMenu'
import { StoreLogo } from '../StoreLogo'
import { ChatWidget } from '../chat/ChatWidget'
import { SupportWidget } from '../chat/SupportWidget'
import { StoreSetupAlert } from './_components/StoreSetupAlert'

interface SidebarProps extends PropsWithChildren {
  items: NavigationItem[]
  redirectPath: 'merchant' | 'user'
}

export function Sidebar({ items, redirectPath, children }: SidebarProps) {
  const [isSticky, setIsSticky] = useState(false)
  const observerTargetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = observerTargetRef.current
    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: '-16px 0px 0px 0px',
      },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const { isAuthenticated, user } = useSession()
  const userRole = user?.role

  const { store } = useStoreData()
  const { selectedStoreId } = useStoreFilter()

  const { data: storeOptions } = useStoreOptions()

  const currentStore =
    storeOptions?.find((s) => s.id === selectedStoreId) || storeOptions?.[0]

  const logoImage = currentStore?.logo ?? store?.logo

  const { data: loyaltySettings } = useLoyaltySettings(
    currentStore?.id || store?.id || selectedStoreId,
  )

  const isPointsEnabled = loyaltySettings?.isPointsEnabled ?? false
  const pointRate = loyaltySettings?.pointRedeemRate
    ? Number(loyaltySettings.pointRedeemRate)
    : 1

  const pathname = usePathname()
  const isMerchant =
    userRole === UserRole.MERCHANT && redirectPath === 'merchant'
  const isEmailUnverified = isAuthenticated && !user?.emailVerified

  return (
    <SidebarProvider>
      <RootSidebar>
        <SidebarHeader className="mx-auto py-5">
          {logoImage ? (
            <StoreLogo image={logoImage} />
          ) : isMerchant ? (
            <LogoBrand />
          ) : (
            <LogoBrandText />
          )}
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
                  {item.hasSeparatorBefore && (
                    <>
                      <Separator className="my-2" />
                      {item.groupLabel && (
                        <SidebarGroupLabel className="px-2 text-xs opacity-80">
                          {item.groupLabel}
                        </SidebarGroupLabel>
                      )}
                    </>
                  )}
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
      </RootSidebar>
      <main
        className="bg-background text-foreground w-full min-w-0 space-y-5 p-5"
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
      >
        {isEmailUnverified && <EmailVerified />}
        {isMerchant && <StoreSetupAlert />}

        <div
          ref={observerTargetRef}
          className="pointer-events-none -mb-px h-px w-full"
        />
        <div className="bg-background sticky top-0 z-20 flex h-fit flex-wrap items-center gap-2.5 border-b py-3 transition-all">
          <SidebarTrigger />
          <QuickSettingsMenu />
          <UserAvatarDropdown redirectPath="merchant" items={items} />
          <div className="flex flex-wrap items-center gap-2.5 transition-opacity duration-200">
            {isMerchant && <DateTimeBadge />}
            <div
              className={`flex flex-wrap items-center gap-2.5 transition-all duration-300 ${
                isSticky
                  ? 'pointer-events-none hidden max-w-0 scale-95 overflow-hidden opacity-0'
                  : 'max-w-125 scale-100 opacity-100'
              }`}
            >
              {isMerchant && <CreditBadge />}
              {isPointsEnabled && (
                <CreditBadge unitName="แต้มสะสม" rate={pointRate} />
              )}
            </div>
          </div>
        </div>
        {children}
        {userRole === UserRole.SUPPORT && <SupportWidget />}
        {userRole !== UserRole.SUPPORT && (
          <ChatWidget conversationType={ConversationType.SUPPORT} />
        )}
      </main>
    </SidebarProvider>
  )
}
