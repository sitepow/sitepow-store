'use server'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export async function getRoleOptions(storeId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !storeId) {
      return []
    }

    const userId = session.user.id

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
