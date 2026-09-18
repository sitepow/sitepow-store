'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import {
  useKitchenOrders,
  useUpdateEntireTicketStatus,
  useUpdateKitchenItemStatus,
} from '@/actions/hooks/restaurant/kitchen'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { KitchenItemStatus } from '@/generated/prisma/enums'
import { useKitchenChime } from '@/hooks/use-kitchen-chime'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconChefHat, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import {
  type AggregatedKitchenItem,
  KitchenAggregatedView,
} from './_components/KitchenAggregatedView'
import { KitchenHeaderActions } from './_components/KitchenHeaderActions'
import { KitchenModeSwitcher } from './_components/KitchenModeSwitcher'
import { KitchenTicketGrid } from './_components/KitchenTicketGrid'

export default function KitchenDisplayPage() {
  const t = useTranslations('merchant.kitchen')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { canViewOrders, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [viewMode, setViewMode] = useState<'tickets' | 'aggregated'>('tickets')
  const { isSoundEnabled, toggleSound, playChime } = useKitchenChime()
  const prevOrderCountRef = useRef(0)

  const activeBranchId =
    selectedBranchId !== ALL_BRANCHES ? selectedBranchId : undefined
  const filterParams = { storeId: selectedStoreId, branchId: activeBranchId }

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useKitchenOrders(filterParams, { refetchInterval: 5000 })

  const updateItemStatusMutation = useUpdateKitchenItemStatus()
  const updateTicketStatusMutation = useUpdateEntireTicketStatus()

  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      playChime()
    }
    prevOrderCountRef.current = orders.length
  }, [orders.length, playChime])

  const aggregatedItems = useMemo<AggregatedKitchenItem[]>(() => {
    const itemsMap = new Map<string, AggregatedKitchenItem>()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.kitchenStatus === KitchenItemStatus.SERVED) return

        const displayTitle = item.productTitle || item.variantTitle
        const key = `${displayTitle}-${item.variantTitle || 'default'}`
        const existing = itemsMap.get(key)
        const tableLabel = order.table?.tableNumber
          ? `${t('tablePrefix')} ${order.table.tableNumber}`
          : t('takeaway')

        if (existing) {
          existing.quantity += item.quantity
          if (!existing.tables.includes(tableLabel)) {
            existing.tables.push(tableLabel)
          }
        } else {
          itemsMap.set(key, {
            title: displayTitle,
            variantTitle: item.variantTitle || '',
            quantity: item.quantity,
            tables: [tableLabel],
          })
        }
      })
    })

    return Array.from(itemsMap.values()).sort((a, b) => b.quantity - a.quantity)
  }, [orders, t])

  const handleItemStatusChange = async (
    orderItemId: string,
    nextStatus: KitchenItemStatus,
  ) => {
    const res = await updateItemStatusMutation.mutateAsync({
      orderItemId,
      status: nextStatus,
    })
    if (!res.success) toast.error(t('emptyDescription'))
  }

  const handleTicketStatusChange = async (
    orderId: string,
    status: KitchenItemStatus,
  ) => {
    const res = await updateTicketStatusMutation.mutateAsync({
      orderId,
      status,
      branchId: activeBranchId,
    })
    if (res.success) {
      toast.success(t('completeTicket'))
    } else {
      toast.error(t('emptyDescription'))
    }
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconChefHat}
        title={t('title')}
        description={t('description')}
        endContent={
          <KitchenHeaderActions
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSound}
            onRefresh={() => refetch()}
          />
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
          <KitchenModeSwitcher
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            ordersCount={orders.length}
            aggregatedCount={aggregatedItems.length}
          />

          {viewMode === 'tickets' ? (
            <KitchenTicketGrid
              orders={orders}
              onItemStatusChange={handleItemStatusChange}
              onTicketStatusChange={handleTicketStatusChange}
            />
          ) : (
            <KitchenAggregatedView items={aggregatedItems} />
          )}
        </div>
      )}
    </Sidebar>
  )
}
