'use client'

import { Fragment, PropsWithChildren } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useUnreadCount } from '@/actions/hooks/chat'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { useLoyaltySettings } from '@/actions/hooks/loyalty'
import { useStoreOptions } from '@/actions/hooks/store'
import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { NavigationItem } from '@/constants/navigation'
import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStoreFilter } from '@/stores/use-store-filter'
import { PermissionKey } from '@/types/permission'
import { IconChevronRight, IconInfoCircle, IconLock } from '@tabler/icons-react'

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

import { cn } from '@/lib/utils'

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

const groupLabelMap: Record<string, string> = {
  สินค้าและคลังสินค้า: 'group_products',
  การจัดการและบุคลากร: 'group_management',
  การตลาดและโปรโมชัน: 'group_marketing',
  ตั้งค่าร้านค้าและบัญชี: 'group_store_settings',
  บัญชีและการตั้งค่า: 'group_account',
}

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
  const { data: unreadChatCount = 0 } = useUnreadCount(user?.id || '')

  const permissions = useEmployeePermission()

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

  const storeThemeStyle = {
    '--primary': currentStore?.primaryColor ?? store?.primaryColor,
  } as React.CSSProperties

  const tNav = useTranslations('merchant.navigation')
  const tShell = useTranslations('merchant.shell')

  const getGroupLabel = (label?: string) => {
    if (!label) return undefined
    const key = groupLabelMap[label]
    if (key && tNav.has(key as any)) {
      return tNav(key as any)
    }
    return label
  }

  const getItemLabel = (val: string, fallback: string) => {
    if (redirectPath === 'user') {
      const buyerKey = `buyer.${val}` as any
      if (tNav.has(buyerKey)) {
        return tNav(buyerKey)
      }
    }
    if (tNav.has(val as any)) {
      return tNav(val as any)
    }
    return fallback
  }

  const checkMenuPermission = (item: {
    permissionKey?: PermissionKey
    value?: string
  }) => {
    if (!isMerchant) {
      return true
    }

    if (!item.permissionKey) return true

    if (item.value === 'chat' && userRole === UserRole.MERCHANT) {
      return true
    }

    return permissions[item.permissionKey] ?? true
  }

  return (
    <SidebarProvider style={storeThemeStyle}>
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

              const hasMainPermission = checkMenuPermission(item)

              return (
                <Fragment key={item.value}>
                  {item.hasSeparatorBefore && (
                    <>
                      <Separator className="my-2" />
                      {item.groupLabel && (
                        <SidebarGroupLabel className="px-2 text-xs opacity-80">
                          {getGroupLabel(item.groupLabel)}
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
                          <SidebarMenuButton
                            isActive={isSubActive}
                            className={cn(
                              !hasMainPermission &&
                                'pointer-events-none opacity-40 select-none',
                            )}
                          >
                            <item.icon className="size-4" />
                            <span className="flex-1 text-left">
                              {getItemLabel(item.value, item.label)}
                            </span>
                            {!hasMainPermission ? (
                              <IconLock className="text-muted-foreground ml-auto size-3.5" />
                            ) : (
                              <IconChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {hasMainPermission && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => {
                                const isSubItemActive = pathname === subItem.url
                                const hasSubPermission =
                                  checkMenuPermission(subItem)

                                return (
                                  <SidebarMenuSubItem key={subItem.value}>
                                    <SidebarMenuSubButton
                                      asChild={hasSubPermission}
                                      isActive={isSubItemActive}
                                      className={cn(
                                        !hasSubPermission &&
                                          'pointer-events-none flex items-center justify-between opacity-40 select-none',
                                      )}
                                    >
                                      {hasSubPermission ? (
                                        <Link href={subItem.url}>
                                          <span>
                                            {getItemLabel(
                                              subItem.value,
                                              subItem.label,
                                            )}
                                          </span>
                                        </Link>
                                      ) : (
                                        <div className="flex w-full items-center justify-between">
                                          <span>
                                            {getItemLabel(
                                              subItem.value,
                                              subItem.label,
                                            )}
                                          </span>
                                          <IconLock className="size-3" />
                                        </div>
                                      )}
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild={hasMainPermission}
                        isActive={isMainActive}
                        className={cn(
                          !hasMainPermission &&
                            'pointer-events-none flex items-center justify-between opacity-40 select-none',
                        )}
                      >
                        {hasMainPermission ? (
                          <Link
                            href={mainUrl}
                            className="flex w-full items-center"
                          >
                            <item.icon className="size-4" />
                            <span className="flex-1">
                              {getItemLabel(item.value, item.label)}
                            </span>
                            {item.value === 'chat' && unreadChatCount > 0 && (
                              <span className="bg-primary text-primary-foreground ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                              </span>
                            )}
                          </Link>
                        ) : (
                          <div className="flex w-full items-center gap-2">
                            <item.icon className="size-4" />
                            <span className="flex-1 text-left">
                              {getItemLabel(item.value, item.label)}
                            </span>
                            <IconLock className="size-3.5" />
                          </div>
                        )}
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
        style={storeThemeStyle}
      >
        {isEmailUnverified && <EmailVerified />}
        {isMerchant && <StoreSetupAlert />}
        <div className="bg-background border-border sticky top-0 z-20 flex items-center justify-between border-b py-2.5">
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
                    <span>{tShell('storeInfo')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{tShell('detailsAndStatus')}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 py-4">
                    {isMerchant && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          {tShell('currentTime')}
                        </span>
                        <DateTimeBadge />
                      </div>
                    )}
                    {isMerchant && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          {tShell('remainingCredits')}
                        </span>
                        <CreditBadge
                          unitName={tShell('creditsUnit')}
                          currencySymbol={tShell('currency')}
                        />
                      </div>
                    )}
                    {isPointsEnabled && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          {tShell('loyaltyPoints')}
                        </span>
                        <CreditBadge
                          unitName={tShell('pointsUnit')}
                          currencySymbol={tShell('currency')}
                          rate={pointRate}
                        />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <UserAvatarDropdown redirectPath={redirectPath} items={items} />
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
