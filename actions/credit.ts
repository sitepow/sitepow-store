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
import { auth } from '@/lib/auth'
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
    const session = userId ? { user: { id: userId } } : await auth()
    const currentUserId = session?.user?.id

    if (!currentUserId) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    if (amount < 60) {
      return { success: false, message: 'จำนวนเงินขั้นต่ำคือ 60 บาท' }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: currentUserId,
      storeId,
      permission: 'canCreateCreditCard',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
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

    return { success: true, data: serializeDecimal(transaction) }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getStoreCredit(storeId: string) {
  try {
    const session = await auth()
    const currentUserId = session?.user?.id

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
