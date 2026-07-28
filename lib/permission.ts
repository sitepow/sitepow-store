'use server'

import { PERMISSION_MAPPING } from '@/constants/permission'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
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
  try {
    const employeeStore = await prisma.employeeStore.findFirst({
      where: {
        storeId,
        employee: { userId },
      },
      include: {
        branches: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            customPermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    if (!employeeStore) {
      return { isAuthorized: false, message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้' }
    }

    let targetBranches = employeeStore.branches || []
    if (branchId && branchId !== ALL_BRANCHES) {
      targetBranches = targetBranches.filter((b) => b.branchId === branchId)
      if (targetBranches.length === 0) {
        return {
          isAuthorized: false,
          message: 'คุณไม่มีสิทธิ์จัดการข้อมูลของสาขานี้',
        }
      }
    }

    if (permission) {
      const targetMapping = PERMISSION_MAPPING[permission]
      if (!targetMapping) {
        return {
          isAuthorized: false,
          message: 'ไม่พบข้อมูลสิทธิ์การใช้งานนี้ในระบบ',
        }
      }

      const hasPermission = targetBranches.some((branchAssignment) => {
        const rolePermissions = branchAssignment.role?.permissions || []
        const customPermissions = branchAssignment.customPermissions || []

        const matchInRole = rolePermissions.some(
          (rp) =>
            rp.permission.domain === targetMapping.domain &&
            rp.permission.action === targetMapping.action,
        )

        const matchInCustom = customPermissions.some(
          (cp) =>
            cp.permission.domain === targetMapping.domain &&
            cp.permission.action === targetMapping.action,
        )

        return matchInRole || matchInCustom
      })

      if (!hasPermission) {
        return {
          isAuthorized: false,
          message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        }
      }
    }

    return {
      isAuthorized: true,
      employeeStore,
    }
  } catch (error) {
    console.error(error)
    return {
      isAuthorized: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
    }
  }
}
