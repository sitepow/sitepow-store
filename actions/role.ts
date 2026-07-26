'use server'

import { DefaultRole } from '@/generated/prisma/enums'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export async function getRoleOptions(storeId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !storeId) {
      return []
    }

    const roles = await prisma.role.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return roles
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getAllPermissions() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        domain: true,
        action: true,
      },
      orderBy: [{ domain: 'asc' }, { action: 'asc' }],
    })

    return permissions
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createRoleWithPermissions(input: {
  storeId: string
  name: string
  permissionIds: string[]
}) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const { storeId, name, permissionIds } = input

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ' }
    }

    const newRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          storeId,
          name: name as DefaultRole,
          rolePermissions: {
            create: permissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        },
        select: {
          id: true,
          name: true,
        },
      })

      return role
    })

    return { success: true, data: newRole }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
