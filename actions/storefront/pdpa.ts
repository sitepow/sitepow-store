'use server'

import { auth } from '@/auth'
import { UserRole } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { randomUUID } from 'crypto'

import { prisma } from '@/lib/prisma'

export async function exportUserData() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      orderNotify: true,
      marketingNotify: true,
      customerProfile: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          customerType: true,
          createdAt: true,
          addresses: true,
          orders: true,
          reviews: true,
          stores: {
            select: {
              totalSpent: true,
              rewardPoints: true,
              store: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  return serializeDecimal(user)
}

export async function deleteUserAccount() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      staffProfile: { select: { id: true } },
      customerProfile: { select: { id: true } },
    },
  })

  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  if (user.role === UserRole.MERCHANT || user.staffProfile) {
    throw new Error(
      'บัญชีนี้เป็นบัญชีร้านค้าไม่สามารถลบได้ กรุณาติดต่อทีมงานหากต้องการปิดร้านค้า',
    )
  }

  await prisma.$transaction(async (tx) => {
    if (user.customerProfile) {
      const customerId = user.customerProfile.id

      await tx.address.deleteMany({ where: { customerId } })

      await tx.cart.deleteMany({ where: { customerId } })

      await tx.customer.update({
        where: { id: customerId },
        data: {
          email: `deleted-${randomUUID()}@sitepow.store`,
          firstName: null,
          lastName: null,
          phone: null,
          avatar: null,
          deletedAt: new Date(),
        },
      })
    }

    await tx.user.delete({ where: { id: userId } })
  })

  return { success: true, message: 'ลบบัญชีผู้ใช้งานสำเร็จแล้ว' }
}
