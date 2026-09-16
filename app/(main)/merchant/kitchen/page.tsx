'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import {
  getKitchenOrders,
  updateEntireTicketStatus,
  updateKitchenItemStatus,
} from '@/actions/restaurant/kitchen'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { KitchenItemStatus } from '@/generated/prisma/enums'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconCheck,
  IconChefHat,
  IconClock,
  IconFlame,
  IconLayoutGrid,
  IconListDetails,
  IconLock,
  IconRefresh,
  IconToolsKitchen2,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'

export default function KitchenDisplayPage() {
  const t = useTranslations('merchant.kitchen')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { canViewOrders, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<'tickets' | 'aggregated'>('tickets')
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  const prevOrderCountRef = useRef(0)

  // Sound Chime using Web Audio API
  const playChime = () => {
    if (!isSoundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Two-tone pleasant kitchen chime
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.4)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2) // A5
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.2)
      osc2.stop(ctx.currentTime + 0.8)
    } catch (err) {
      console.warn('Audio Context error:', err)
    }
  }

  const loadKitchenOrders = async () => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) return
    try {
      const res = await getKitchenOrders({
        storeId: selectedStoreId,
        branchId:
          selectedBranchId !== ALL_BRANCHES ? selectedBranchId : undefined,
      })
      if (res.success && res.data) {
        if (res.data.length > prevOrderCountRef.current) {
          playChime()
        }
        prevOrderCountRef.current = res.data.length
        setOrders(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    loadKitchenOrders()
    const interval = setInterval(loadKitchenOrders, 6000)
    return () => clearInterval(interval)
  }, [selectedStoreId, selectedBranchId])

  // Handlers for single item status
  const handleItemStatusChange = (
    orderItemId: string,
    nextStatus: KitchenItemStatus,
  ) => {
    startTransition(async () => {
      const res = await updateKitchenItemStatus({
        orderItemId,
        status: nextStatus,
      })
      if (res.success) {
        loadKitchenOrders()
      } else {
        toast.error(t('emptyDescription'))
      }
    })
  }

  // Handlers for entire ticket
  const handleTicketStatusChange = (
    orderId: string,
    status: KitchenItemStatus,
  ) => {
    startTransition(async () => {
      const res = await updateEntireTicketStatus({ orderId, status })
      if (res.success) {
        toast.success(t('completeTicket'))
        loadKitchenOrders()
      } else {
        toast.error(t('emptyDescription'))
      }
    })
  }

  // Timer helper
  const getElapsedMinutes = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    return Math.floor(diff / 60000)
  }

  // Aggregated view calculations
  const aggregatedItemsMap = new Map<
    string,
    { title: string; variantTitle: string; quantity: number; tables: string[] }
  >()

  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      if (item.kitchenStatus !== KitchenItemStatus.SERVED) {
        const key = `${item.title}-${item.variantTitle || 'default'}`
        const existing = aggregatedItemsMap.get(key)
        const tableLabel = order.table?.tableNumber
          ? `${t('tablePrefix')} ${order.table.tableNumber}`
          : t('takeaway')

        if (existing) {
          existing.quantity += item.quantity
          if (!existing.tables.includes(tableLabel)) {
            existing.tables.push(tableLabel)
          }
        } else {
          aggregatedItemsMap.set(key, {
            title: item.title,
            variantTitle: item.variantTitle || '',
            quantity: item.quantity,
            tables: [tableLabel],
          })
        }
      }
    })
  })

  const aggregatedItems = Array.from(aggregatedItemsMap.values()).sort(
    (a, b) => b.quantity - a.quantity,
  )

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconChefHat}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-2">
            <StoreSelectField />
            <BranchSelectField />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            >
              {isSoundEnabled ? (
                <IconVolume className="text-primary mr-2 size-4" />
              ) : (
                <IconVolumeOff className="text-muted-foreground mr-2 size-4" />
              )}
              {isSoundEnabled ? t('soundOn') : t('soundOff')}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsLoading(true)
                loadKitchenOrders()
              }}
            >
              <IconRefresh className="size-4" />
            </Button>
          </div>
        }
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : selectedBranchId === ALL_BRANCHES ? (
        <ActionRequiredAlert
          title={t('selectBranchTitle')}
          description={t('selectBranchDescription')}
        />
      ) : !isPermissionLoading && !canViewOrders ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <div className="space-y-4">
          {/* View Switcher - Default shadcn/ui Tabs */}
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as any)}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="tickets" className="gap-2">
                <IconListDetails className="size-4" />
                {t('viewTickets', { count: orders.length })}
              </TabsTrigger>
              <TabsTrigger value="aggregated" className="gap-2">
                <IconLayoutGrid className="size-4" />
                {t('viewAggregated', { count: aggregatedItems.length })}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View 1: Ticket Cards View */}
          {viewMode === 'tickets' ? (
            orders.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent className="space-y-3">
                  <IconToolsKitchen2 className="text-muted-foreground mx-auto size-16 opacity-40" />
                  <CardTitle className="text-xl">{t('emptyTitle')}</CardTitle>
                  <CardDescription className="mx-auto max-w-md">
                    {t('emptyDescription')}
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orders.map((order) => {
                  const elapsed = getElapsedMinutes(order.createdAt)
                  const isDelayed = elapsed >= 20
                  const isWarning = elapsed >= 10 && elapsed < 20

                  const allPending = order.items.every(
                    (i: any) => i.kitchenStatus === KitchenItemStatus.PENDING,
                  )
                  const allReady = order.items.every(
                    (i: any) =>
                      i.kitchenStatus === KitchenItemStatus.READY ||
                      i.kitchenStatus === KitchenItemStatus.SERVED,
                  )

                  return (
                    <Card
                      key={order.id}
                      className={cn(
                        'flex flex-col justify-between transition-colors',
                        isDelayed && 'border-destructive/60 bg-destructive/5',
                        isWarning &&
                          !isDelayed &&
                          'border-amber-500/50 bg-amber-500/5',
                      )}
                    >
                      {/* Ticket Header */}
                      <CardHeader className="border-b pb-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-bold">
                                {order.table?.tableNumber
                                  ? `${t('tablePrefix')} ${order.table.tableNumber}`
                                  : t('takeaway')}
                              </CardTitle>
                              {order.table?.zone?.name && (
                                <Badge variant="secondary" className="text-xs">
                                  {order.table.zone.name}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="font-mono text-xs">
                              #{order.orderNumber}
                            </CardDescription>
                          </div>

                          <Badge
                            variant={
                              isDelayed
                                ? 'destructive'
                                : isWarning
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="gap-1 font-mono text-xs"
                          >
                            <IconClock className="size-3" />
                            {t('minutes', { count: elapsed })}
                          </Badge>
                        </div>
                      </CardHeader>

                      {/* Global Kitchen Note */}
                      {order.kitchenNote && (
                        <div className="bg-muted text-muted-foreground border-b px-4 py-2 text-xs font-medium">
                          {t('kitchenNote', { note: order.kitchenNote })}
                        </div>
                      )}

                      {/* Items List */}
                      <CardContent className="flex-1 divide-y p-4">
                        {order.items.map((item: any) => {
                          const isItemPending =
                            item.kitchenStatus === KitchenItemStatus.PENDING
                          const isCooking =
                            item.kitchenStatus === KitchenItemStatus.COOKING
                          const isReady =
                            item.kitchenStatus === KitchenItemStatus.READY
                          const isServed =
                            item.kitchenStatus === KitchenItemStatus.SERVED

                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                            >
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-primary min-w-[20px] text-sm font-bold">
                                    {item.quantity}×
                                  </span>
                                  <span
                                    className={cn(
                                      'text-sm font-medium',
                                      isReady &&
                                        'text-muted-foreground line-through',
                                    )}
                                  >
                                    {item.title}
                                  </span>
                                </div>
                                {item.variantTitle &&
                                  !['ปกติ', 'Default', 'default'].includes(
                                    item.variantTitle,
                                  ) && (
                                    <p className="text-muted-foreground text-xs">
                                      {t('variantPrefix', {
                                        variant: item.variantTitle,
                                      })}
                                    </p>
                                  )}
                                {item.customerNote && (
                                  <p className="text-primary text-xs font-medium">
                                    ★ {item.customerNote}
                                  </p>
                                )}
                              </div>

                              {/* Action per item */}
                              <div className="flex-shrink-0">
                                {isItemPending && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleItemStatusChange(
                                        item.id,
                                        KitchenItemStatus.COOKING,
                                      )
                                    }
                                  >
                                    {t('startCooking')}
                                  </Button>
                                )}
                                {isCooking && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleItemStatusChange(
                                        item.id,
                                        KitchenItemStatus.READY,
                                      )
                                    }
                                  >
                                    {t('finishCooking')}
                                  </Button>
                                )}
                                {isReady && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      handleItemStatusChange(
                                        item.id,
                                        KitchenItemStatus.SERVED,
                                      )
                                    }
                                  >
                                    <IconCheck className="mr-1 size-3.5" />
                                    {t('served')}
                                  </Button>
                                )}
                                {isServed && (
                                  <Badge variant="outline">{t('served')}</Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>

                      {/* Ticket Footer */}
                      <CardFooter className="border-t pt-3">
                        {allPending ? (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              handleTicketStatusChange(
                                order.id,
                                KitchenItemStatus.COOKING,
                              )
                            }
                          >
                            <IconFlame className="mr-2 size-4" />
                            {t('startAll')}
                          </Button>
                        ) : !allReady ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="w-full"
                            onClick={() =>
                              handleTicketStatusChange(
                                order.id,
                                KitchenItemStatus.READY,
                              )
                            }
                          >
                            <IconCheck className="mr-2 size-4" />
                            {t('readyAll')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() =>
                              handleTicketStatusChange(
                                order.id,
                                KitchenItemStatus.SERVED,
                              )
                            }
                          >
                            {t('completeTicket')}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            /* View 2: Aggregated Items View - Default shadcn Cards */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {aggregatedItems.map((item, idx) => (
                <Card key={idx} className="flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {item.title}
                        </CardTitle>
                        {item.variantTitle && (
                          <CardDescription className="text-xs">
                            {item.variantTitle}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant="default"
                        className="px-2.5 py-0.5 text-base font-bold"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="text-muted-foreground border-t pt-2 text-xs">
                    <span className="text-foreground mr-1 font-semibold">
                      {t('fromTables')}
                    </span>
                    {item.tables.join(', ')}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Sidebar>
  )
}
