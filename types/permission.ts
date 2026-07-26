import { PermissionAction, PermissionDomain } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export type PermissionKey =
  | 'canViewCreditCard'
  | 'canViewDashboard'
  | 'canManageStaff'
  | 'canManageProducts'
  | 'canManageInventory'
  | 'canManageStock'
  | 'canCreateOrder'
  | 'canManageOrders'
  | 'canCancelOrder'
  | 'canManageCoupons'
  | 'canManageCustomers'
  | 'canManageStoreSettings'
  | 'canViewFinance'
  | 'canViewActivityLogs'
  | 'canManageBranches'
  | 'canManageBlogs'
  | 'canManageShipping'
  | 'canManagePayment'
  | 'canManageSubscription'
  | 'canManageConversation'

export const permissionMapping: Record<
  PermissionKey,
  { domain: PermissionDomain; action: PermissionAction }
> = {
  canViewCreditCard: {
    domain: PermissionDomain.TRANSACTION,
    action: PermissionAction.READ,
  },
  canViewDashboard: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canManageStaff: {
    domain: PermissionDomain.STAFF,
    action: PermissionAction.CREATE,
  },
  canManageProducts: {
    domain: PermissionDomain.PRODUCT,
    action: PermissionAction.UPDATE,
  },
  canManageInventory: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.UPDATE,
  },
  canManageStock: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.UPDATE,
  },
  canCreateOrder: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.CREATE,
  },
  canManageOrders: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.UPDATE,
  },
  canCancelOrder: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.CANCEL,
  },
  canManageCoupons: {
    domain: PermissionDomain.COUPON,
    action: PermissionAction.CREATE,
  },
  canManageCustomers: {
    domain: PermissionDomain.CUSTOMER,
    action: PermissionAction.UPDATE,
  },
  canManageStoreSettings: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canViewFinance: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canViewActivityLogs: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canManageBranches: {
    domain: PermissionDomain.BRANCH,
    action: PermissionAction.UPDATE,
  },
  canManageBlogs: {
    domain: PermissionDomain.BLOG,
    action: PermissionAction.CREATE,
  },
  canManageShipping: {
    domain: PermissionDomain.SHIPPING,
    action: PermissionAction.UPDATE,
  },
  canManagePayment: {
    domain: PermissionDomain.PAYMENT,
    action: PermissionAction.UPDATE,
  },
  canManageSubscription: {
    domain: PermissionDomain.SUBSCRIPTION,
    action: PermissionAction.UPDATE,
  },
  canManageConversation: {
    domain: PermissionDomain.CONVERSATION,
    action: PermissionAction.READ,
  },
}

export async function checkPermission(
  roleId: string,
  permission: PermissionKey,
): Promise<boolean> {
  const target = permissionMapping[permission]
  if (!target) {
    return false
  }

  const count = await prisma.rolePermission.count({
    where: {
      roleId,
      permission: {
        domain: target.domain,
        action: target.action,
      },
    },
  })

  return count > 0
}
