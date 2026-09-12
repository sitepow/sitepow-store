'use server'

import {
  ActorType,
  LogAction,
  Prisma,
  TransactionType,
} from '@/generated/prisma/client'
import { getCredits } from '@/utils/credit'
import { serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  description: true,
  createdAt: true,
} satisfies Prisma.TransactionSelect

export async function purchaseCredit({
  storeId,
  amount,
  description,
  userId,
}: {
  storeId: string
  amount: number
  description?: string
  userId?: string
}) {
  try {
    const userSession = await getCurrentUser()
    const currentUserId = userId || userSession?.id

    if (!currentUserId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
        message: 'ไม่พบข้อมูลผู้ใช้งาน',
      }
    }

    if (amount < 60) {
      return {
        success: false,
        messageTH: 'จำนวนเงินขั้นต่ำคือ 60 บาท',
        messageEN: 'Minimum amount is 60 THB',
        message: 'จำนวนเงินขั้นต่ำคือ 60 บาท',
      }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลร้านค้า',
        messageEN: 'Store not found',
        message: 'ไม่พบข้อมูลร้านค้า',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId: currentUserId,
      storeId,
      permission: 'canCreateCreditCard',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: 'สิทธิ์การใช้งานของคุณไม่เพียงพอสำหรับการเติมเครดิต',
        messageEN: 'Insufficient permissions to purchase credits',
        message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอสำหรับการเติมเครดิต',
      }
    }

    const creditAmount = getCredits(amount)

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          storeId,
          amount: creditAmount,
          type: TransactionType.CREDIT_PURCHASE,
          description: `ซื้อเครดิต ${creditAmount} Credits`,
        },
        select: transactionSelect,
      }),
      prisma.store.update({
        where: { id: storeId },
        data: { balance: { increment: creditAmount } },
      }),
    ])

    await createLog({
      action: LogAction.ADJUST_CREDITS,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Transaction',
      entityId: transaction.id,
      details: {
        paidAmount: amount,
        creditedAmount: creditAmount,
        description,
      },
    })

    return {
      success: true,
      messageTH: 'เติมเครดิตสำเร็จแล้ว',
      messageEN: 'Credits purchased successfully',
      message: 'เติมเครดิตสำเร็จแล้ว',
      data: serializeDecimal(transaction),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการเติมเครดิต',
      messageEN: 'An error occurred while purchasing credits',
      message: 'เกิดข้อผิดพลาดในการเติมเครดิต',
    }
  }
}

export async function getStoreCredit(storeId: string) {
  try {
    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId) {
      return null
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, balance: true },
    })

    if (!store) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId: currentUserId,
      storeId,
      permission: 'canViewCreditCard',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return serializeDecimal({ balance: store.balance })
  } catch (error) {
    console.error(error)
    return null
  }
}
