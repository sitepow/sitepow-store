import { StaffRole } from '@/generated/prisma/enums'

export type PermissionKey =
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

export function checkPermission(
  role: StaffRole,
  permission: PermissionKey,
): boolean {
  const isAdmin = role === StaffRole.ADMIN
  const isManager = role === StaffRole.MANAGER
  const isCashier = role === StaffRole.CASHIER

  const permissionsMap: Record<PermissionKey, boolean> = {
    canManageStaff: isAdmin,
    canManageProducts: isAdmin || isManager,
    canManageInventory: isAdmin || isManager,
    canManageStock: isAdmin || isManager,
    canCreateOrder: true,
    canManageOrders: isAdmin || isManager || isCashier,
    canCancelOrder: isAdmin || isManager,
    canManageCoupons: isAdmin || isManager,
    canManageCustomers: isAdmin || isManager,
    canManageStoreSettings: isAdmin,
    canViewFinance: isAdmin,
    canViewActivityLogs: isAdmin,
  }

  return permissionsMap[permission] ?? false
}
