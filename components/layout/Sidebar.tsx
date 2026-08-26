'use client'

import { Fragment, PropsWithChildren } from 'react'

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
import { IconChevronRight, IconInfoCircle } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

  const hasBadgesToShow = isMerchant || isPointsEnabled

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
        className="bg-background text-foreground w-full min-w-0 space-y-5 p-3 sm:p-5"
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
      >
        {isEmailUnverified && <EmailVerified />}
        {isMerchant && <StoreSetupAlert />}

        <div className="bg-background/95 border-border sticky top-0 z-20 flex items-center justify-between border-b py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <QuickSettingsMenu />
          </div>

          <div className="flex items-center gap-2">
            {hasBadgesToShow && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <IconInfoCircle className="text-muted-foreground size-4" />
                    <span>ข้อมูลร้านค้า</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>รายละเอียดและสถานะ</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 py-4">
                    {isMerchant && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          เวลาปัจจุบัน:
                        </span>
                        <DateTimeBadge />
                      </div>
                    )}
                    {isMerchant && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          เครดิตคงเหลือ:
                        </span>
                        <CreditBadge />
                      </div>
                    )}
                    {isPointsEnabled && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          แต้มสะสม:
                        </span>
                        <CreditBadge unitName="แต้มสะสม" rate={pointRate} />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <UserAvatarDropdown redirectPath="merchant" items={items} />
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
