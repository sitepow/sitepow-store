'use server'

import { KitchenItemStatus } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { appEvents } from '@/lib/events'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export async function getKitchenOrders({
  storeId,
  branchId,
}: {
  storeId: string
  branchId?: string
}) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, data: [] }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId,
      branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, data: [] }
    }

    // Find orders that have active kitchen items (PENDING, COOKING, READY)
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        status: { notIn: ['CANCELLED'] },
        items: {
          some: {
            ...(branchId ? { branchId } : {}),
            kitchenStatus: {
              in: [
                KitchenItemStatus.PENDING,
                KitchenItemStatus.COOKING,
                KitchenItemStatus.READY,
              ],
            },
          },
        },
      },
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            zone: { select: { name: true } },
          },
        },
        items: {
          where: {
            ...(branchId ? { branchId } : {}),
            kitchenStatus: { notIn: [KitchenItemStatus.CANCELLED] },
          },
          orderBy: { title: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' }, // FIFO: oldest orders first
    })

    return { success: true, data: serializeDecimal(orders) }
  } catch (error) {
    console.error('Error getting kitchen orders:', error)
    return { success: false, data: [] }
  }
}

export async function updateKitchenItemStatus({
  orderItemId,
  status,
}: {
  orderItemId: string
  status: KitchenItemStatus
}) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: { select: { id: true, storeId: true, tableId: true } },
      },
    })
    if (!item) {
      return { success: false, messageTH: 'ไม่พบรายการอาหาร' }
    }

    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { kitchenStatus: status },
    })

    // Notify kitchen and table
    appEvents.publish(`kitchen:${item.order.storeId}`, {
      type: 'KITCHEN_ITEM_UPDATED',
      orderItemId,
      status,
      orderId: item.order.id,
    })

    return {
      success: true,
      data: serializeDecimal(updated),
      messageTH: 'อัปเดตสถานะสำเร็จ',
    }
  } catch (error) {
    console.error('Error updating kitchen item status:', error)
    return { success: false, messageTH: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' }
  }
}

export async function updateEntireTicketStatus({
  orderId,
  status,
}: {
  orderId: string
  status: KitchenItemStatus
}) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { storeId: true, tableId: true },
    })
    if (!order) {
      return { success: false, messageTH: 'ไม่พบคำสั่งซื้อ' }
    }

    await prisma.orderItem.updateMany({
      where: {
        orderId,
        kitchenStatus: { notIn: [KitchenItemStatus.CANCELLED] },
      },
      data: { kitchenStatus: status },
    })

    appEvents.publish(`kitchen:${order.storeId}`, {
      type: 'KITCHEN_TICKET_UPDATED',
      orderId,
      status,
    })

    return {
      success: true,
      messageTH: `อัปเดตออเดอร์เป็น ${status} สำเร็จ`,
    }
  } catch (error) {
    console.error('Error updating ticket status:', error)
    return { success: false, messageTH: 'เกิดข้อผิดพลาดในการอัปเดต' }
  }
}
