'use server'

import { auth } from '@/auth'
import {
  ActorType,
  LogAction,
  Prisma,
  TransactionType,
} from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  description: true,
  createdAt: true,
} satisfies Prisma.TransactionSelect

export async function depositBalance({
  storeId,
  amount,
  description,
}: {
  storeId: string
  amount: number
  description?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId, ownerId: session.user.id },
    select: { id: true },
  })

  if (!store) {
    throw new Error('ไม่พบข้อมูลร้านค้า')
  }

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        storeId,
        amount,
        type: TransactionType.DEPOSIT,
        description: description || 'เติมเงิน Wallet',
      },
      select: transactionSelect,
    }),
    prisma.store.update({
      where: { id: storeId },
      data: { balance: { increment: amount } },
    }),
  ])

  await createLog({
    action: LogAction.UPDATE_STORE_SETTING,
    actorType: ActorType.MERCHANT,
    storeId,
    entity: 'Transaction',
    entityId: transaction.id,
    details: { type: 'deposit', amount, description },
  })

  return serializeDecimal(transaction)
}

export async function getStoreBalance(storeId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId, ownerId: session.user.id },
    select: { balance: true },
  })

  return serializeDecimal(store)
}
