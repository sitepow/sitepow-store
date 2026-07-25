'use server'

import { CreateRoleInput } from '@/zod/role'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/auth-guard'
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
        description: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return roles
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createRole(input: CreateRoleInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const { storeId, name, description } = input

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ' }
    }

    const newRole = await prisma.role.create({
      data: {
        storeId,
        name,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    return { success: true, data: newRole }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
