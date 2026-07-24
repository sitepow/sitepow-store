'use server'

import { StaffRole } from '@/generated/prisma/enums'
import { PermissionKey, checkPermission } from '@/types/permission'

import { prisma } from '@/lib/prisma'

interface VerifyStaffPermissionOptions {
  userId: string
  storeId: string
  permission?: PermissionKey
  branchId?: string
}

export async function verifyStaffPermission({
  userId,
  storeId,
  permission,
  branchId,
}: VerifyStaffPermissionOptions) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  if (store?.ownerId === userId) {
    return { isAuthorized: true, role: 'OWNER', staffStore: null }
  }

  const staffStore = await prisma.staffStore.findFirst({
    where: {
      storeId,
      staff: { userId },
    },
    include: {
      branches: true,
    },
  })

  if (!staffStore) {
    return { isAuthorized: false, message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้' }
  }

  if (permission && !checkPermission(staffStore.role, permission)) {
    return { isAuthorized: false, message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ' }
  }

  if (branchId && staffStore.role !== StaffRole.ADMIN) {
    const hasBranchAccess = staffStore.branches.some(
      (b) => b.branchId === branchId,
    )
    if (!hasBranchAccess) {
      return {
        isAuthorized: false,
        message: 'คุณไม่มีสิทธิ์จัดการข้อมูลของสาขานี้',
      }
    }
  }

  return { isAuthorized: true, staffStore }
}
