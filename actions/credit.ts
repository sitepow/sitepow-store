'use server'

import { EXCHANGE_RATE } from '@/constants/credit'
import {
  ActorType,
  LogAction,
  Prisma,
  TransactionType,
} from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
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
}: {
  storeId: string
  amount: number
  description?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId, ownerId: session.user.id },
      select: { id: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    const creditAmount = Math.floor(amount * EXCHANGE_RATE)

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          storeId,
          amount: creditAmount,
          type: TransactionType.CREDIT_PURCHASE,
          description: description || `ซื้อเครดิต ${creditAmount} Credits`,
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
    if (!session?.user?.id) {
      return null
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId, ownerId: session.user.id },
      select: { balance: true },
    })

    return serializeDecimal(store)
  } catch (error) {
    console.error(error)
    return null
  }
}
