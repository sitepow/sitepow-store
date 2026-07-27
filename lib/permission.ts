'use server'

import { PERMISSION_MAPPING } from '@/constants/permission'
import { PermissionKey } from '@/types/permission'

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
      permissions: {
        include: {
          permission: true,
        },
      },
      branches: true,
    },
  })

  if (!isOwner && !employeeStore) {
    return { isAuthorized: false, message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้' }
  }

  if (permission && !isOwner && employeeStore) {
    const targetMapping = PERMISSION_MAPPING[permission]
    if (targetMapping) {
      const hasPermission = employeeStore.permissions.some(
        (ep) =>
          ep.permission.domain === targetMapping.domain &&
          ep.permission.action === targetMapping.action,
      )

      if (!hasPermission) {
        return {
          isAuthorized: false,
          message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        }
      }
    } else {
      return {
        isAuthorized: false,
        message: 'ไม่พบข้อมูลสิทธิ์การใช้งานนี้ในระบบ',
      }
    }
  }

  if (branchId && !isOwner && employeeStore) {
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

  return {
    isAuthorized: true,
    employeeStore,
  }
}
