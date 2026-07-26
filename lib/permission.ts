'use server'

import { PermissionRole } from '@/generated/prisma/enums'
import { PermissionKey, checkPermission } from '@/types/permission'

import { prisma } from '@/lib/prisma'

interface VerifyEmployeePermissionOptions {
  userId: string
  storeId: string
  permission?: PermissionKey
  branchId?: string
}

export async function verifyEmployeePermission({
  userId,
  storeId,
  permission,
  branchId,
}: VerifyEmployeePermissionOptions) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  const isOwner = store?.ownerId === userId

  const employeeStore = await prisma.employeeStore.findFirst({
    where: {
      storeId,
      employee: { userId },
    },
    include: {
      role: true,
      branches: true,
    },
  })

  if (!isOwner && !employeeStore) {
    return { isAuthorized: false, message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้' }
  }

  if (permission && employeeStore) {
    const hasAccess = await checkPermission(employeeStore.roleId, permission)
    if (!hasAccess) {
      return { isAuthorized: false, message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ' }
    }
  }

  if (branchId && employeeStore) {
    const isAdmin = employeeStore.role.name === PermissionRole.ADMIN
    if (!isAdmin) {
      const hasBranchAccess = employeeStore.branches.some(
        (b) => b.branchId === branchId,
      )
      if (!hasBranchAccess) {
        return {
          isAuthorized: false,
          message: 'คุณไม่มีสิทธิ์จัดการข้อมูลของสาขานี้',
        }
      }
    }
  }

  return {
    isAuthorized: true,
    employeeStore,
  }
}
