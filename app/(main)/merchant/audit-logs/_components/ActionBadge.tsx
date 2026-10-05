'use client'

import { LogAction } from '@/generated/prisma/enums'
import {
  IconBuildingStore,
  IconClockCancel,
  IconCreditCard,
  IconEdit,
  IconFileText,
  IconHistory,
  IconLock,
  IconLockOpen,
  IconLogin,
  IconLogout,
  IconPackage,
  IconReceipt,
  IconRefresh,
  IconSettings,
  IconShoppingCart,
  IconTrash,
  IconTruckDelivery,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'

import { LOG_ACTION_CONFIG } from '@/utils/activity/formatter'

interface ActionBadgeProps {
  action: LogAction
  showIcon?: boolean
  className?: string
}

function getActionIcon(action: LogAction) {
  switch (action) {
    case LogAction.CREATE_STORE:
    case LogAction.UPDATE_STORE:
    case LogAction.DELETE_STORE:
      return IconBuildingStore
    case LogAction.CREATE_ORDER:
      return IconShoppingCart
    case LogAction.UPDATE_ORDER_STATUS:
      return IconTruckDelivery
    case LogAction.CANCEL_ORDER:
      return IconClockCancel
    case LogAction.RESTOCK_ITEMS:
      return IconRefresh
    case LogAction.UPDATE_STOCK:
      return IconPackage
    case LogAction.STOCK_TRANSFER:
      return IconTruckDelivery
    case LogAction.CREATE_PRODUCT:
      return IconPackage
    case LogAction.DELETE_PRODUCT:
      return IconTrash
    case LogAction.MANAGE_EMPLOYEE:
      return IconUsers
    case LogAction.TRANSFER_STORE:
      return IconUserCheck
    case LogAction.BLOCK_CUSTOMER:
      return IconLock
    case LogAction.UNBLOCK_CUSTOMER:
      return IconLockOpen
    case LogAction.CREATE_BLOG:
    case LogAction.UPDATE_BLOG:
    case LogAction.DELETE_BLOG:
      return IconFileText
    case LogAction.CREATE_EXPENSE:
    case LogAction.UPDATE_EXPENSE:
    case LogAction.DELETE_EXPENSE:
      return IconReceipt
    case LogAction.CHANGE_PLAN:
    case LogAction.ADJUST_CREDITS:
      return IconCreditCard
    case LogAction.UPDATE_STORE_SETTING:
      return IconSettings
    case LogAction.LOGIN:
      return IconLogin
    case LogAction.LOGOUT:
      return IconLogout
    default:
      return IconHistory
  }
}

export function ActionBadge({
  action,
  showIcon = true,
  className = '',
}: ActionBadgeProps) {
  const meta = LOG_ACTION_CONFIG[action] || {
    label: action,
    categoryLabel: 'กิจกรรม',
    color: {
      badge: 'bg-muted text-foreground border-border',
      dot: 'bg-muted-foreground',
      border: 'border-border',
      subtle: 'bg-muted/50',
      iconColor: 'text-muted-foreground',
    },
  }

  const IconComponent = getActionIcon(action)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight whitespace-nowrap transition-colors ${meta.color.badge} ${className}`}
    >
      {showIcon && (
        <IconComponent size={13} className={`shrink-0 ${meta.color.iconColor}`} />
      )}
      <span>{meta.label}</span>
    </span>
  )
}
