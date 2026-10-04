'use server'

import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

export async function getRoleOptions(storeId: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId || !storeId) {
      return []
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewEmployee',
    })

    if (!authCheck.isAuthorized) {
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
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
