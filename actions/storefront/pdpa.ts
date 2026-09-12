'use server'

import { UserRole } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { randomUUID } from 'crypto'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function exportUserData() {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            addresses: {
              select: {
                receiverName: true,
                addressLine: true,
                subDistrict: true,
                district: true,
                province: true,
                postalCode: true,
              },
            },
            orders: {
              select: {
                orderNumber: true,
                totalAmount: true,
                status: true,
                createdAt: true,
                store: {
                  select: {
                    name: true,
                  },
                },
                items: {
                  select: {
                    title: true,
                    quantity: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return null
    }

    return serializeDecimal(user)
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function deleteUserAccount() {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        employee: { select: { id: true } },
        customer: { select: { id: true } },
      },
    })

    if (!user) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const isMerchant = user.role === UserRole.MERCHANT || !!user.employee

    await prisma.$transaction(async (tx) => {
      if (user.customer) {
        const customerId = user.customer.id

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

      if (!isMerchant) {
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted-${randomUUID()}@sitepow.store`,
            name: 'Deleted User',
            phone: null,
          },
        })
      }
    })

    return {
      success: true,
      messageTH: isMerchant
        ? 'ลบข้อมูลส่วนตัวผู้ซื้อสำเร็จแล้ว'
        : 'ลบบัญชีผู้ใช้งานสำเร็จแล้ว',
      messageEN: isMerchant
        ? 'Buyer personal data deleted successfully'
        : 'User account deleted successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
