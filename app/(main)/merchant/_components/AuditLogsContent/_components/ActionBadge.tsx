'use client'

import { LOG_ACTION_TH } from '@/constants/translate'
import { LogAction } from '@/generated/prisma/enums'

import { Badge } from '@/components/ui/badge'

interface ActionBadgeProps {
  action: LogAction
}

export function ActionBadge({ action }: ActionBadgeProps) {
  const label = LOG_ACTION_TH[action] || action

  const getVariant = (
    act: LogAction,
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (act) {
      case LogAction.SUSPEND_STORE:
      case LogAction.DELETE_PRODUCT:
      case LogAction.CANCEL_ORDER:
        return 'destructive'

      case LogAction.CHANGE_PLAN:
      case LogAction.ADJUST_CREDITS:
      case LogAction.MANAGE_STAFF:
      case LogAction.CREATE_ORDER:
        return 'default'

      case LogAction.UPDATE_STOCK:
      case LogAction.RESTOCK_ITEMS:
      case LogAction.STOCK_TRANSFER:
      case LogAction.CREATE_PRODUCT:
      case LogAction.UPDATE_ORDER_STATUS:
        return 'outline'

      case LogAction.LOGIN:
      case LogAction.LOGOUT:
      case LogAction.UPDATE_STORE_SETTING:
      default:
        return 'secondary'
    }
  }

  return (
    <Badge
      variant={getVariant(action)}
      className="px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
    >
      {label}
    </Badge>
  )
}
