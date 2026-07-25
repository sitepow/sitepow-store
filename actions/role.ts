'use server'

import { auth } from '@/lib/auth'
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
