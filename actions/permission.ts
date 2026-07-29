'use server'

import { DefaultRole } from '@/generated/prisma/enums'

import {
  TransactionClient,
  initializeStoreRolesAndPermissions as initStoreRoles,
  resetStoreRolePermissions as resetRolePerms,
} from '@/lib/permission'

export async function initializeStoreRolesAndPermissions(
  storeId: string,
  tx?: TransactionClient,
) {
  return await initStoreRoles(storeId, tx)
}

export async function resetStoreRolePermissions(
  storeId: string,
  employeeId: string,
  roleName: DefaultRole,
  branchId?: string,
) {
  return await resetRolePerms(storeId, employeeId, roleName, branchId)
}
