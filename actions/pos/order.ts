'use server'

import { PaymentMethod } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { earnCustomerPoints } from '@/utils/points'

import { auth } from '@/lib/auth'
import { createOrderCore } from '@/lib/order'
import { CreateOrderCoreInput } from '@/lib/order/types'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export async function createPOSOrder(input: CreateOrderCoreInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateOrder',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'ไม่มีสิทธิ์ในการสร้างคำสั่งซื้อ' }
    }

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    })

    const orders = await createOrderCore({
      storeId: input.storeId,
      branchId: input.branchId,
      customerId: input.customerId,
      employeeId: employee?.id,
      paymentMethod: input.paymentMethod,
      status: input.status,
      receivedAmount: input.receivedAmount,
      changeAmount: input.changeAmount,
      discountAmount: input.discountAmount,
      usedPoints: input.usedPoints,
      items: input.items,
      isPOS: true,
    })

    if (
      input.paymentMethod === PaymentMethod.CASH_ON_DELIVERY &&
      orders.length > 0
    ) {
      await prisma.$transaction(async (tx) => {
        for (const order of orders) {
          if (
            order.customerId &&
            order.earnedPoints &&
            order.earnedPoints > 0
          ) {
            await earnCustomerPoints({
              tx,
              customerId: order.customerId,
              storeId: order.storeId,
              earnedPoints: order.earnedPoints,
            })
          }
        }
      })
    }

    return {
      success: true,
      message: 'ทำรายการขายสำเร็จ',
      data: serializeDecimal(orders[0]),
    }
  } catch (error: unknown) {
    console.error(error)
    let errorMessage

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
}
