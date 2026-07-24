'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'

import { StaffRole } from '@/generated/prisma/enums'
import { checkPermission } from '@/types/permission'

export function useStaffPermission() {
  const { data: session } = useNextAuthSession()
  const role = session?.user?.role

  const isAdmin = role === StaffRole.ADMIN
  const isManager = role === StaffRole.MANAGER
  const isCashier = role === StaffRole.CASHIER

  return {
    isAdmin,
    isManager,
    isCashier,
    canManageStaff: role ? checkPermission(role, 'canManageStaff') : false,
    canManageProducts: role
      ? checkPermission(role, 'canManageProducts')
      : false,
    canManageInventory: role
      ? checkPermission(role, 'canManageInventory')
      : false,
    canManageStock: role ? checkPermission(role, 'canManageStock') : false,
    canCreateOrder: true,
    canManageOrders: role ? checkPermission(role, 'canManageOrders') : false,
    canCancelOrder: role ? checkPermission(role, 'canCancelOrder') : false,
    canManageCoupons: role ? checkPermission(role, 'canManageCoupons') : false,
    canManageCustomers: role
      ? checkPermission(role, 'canManageCustomers')
      : false,
    canManageStoreSettings: role
      ? checkPermission(role, 'canManageStoreSettings')
      : false,
    canViewFinance: role ? checkPermission(role, 'canViewFinance') : false,
    canViewActivityLogs: role
      ? checkPermission(role, 'canViewActivityLogs')
      : false,
  }
}
