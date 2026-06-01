'use server'

import { PLAN_RANK } from '@/config/plans'
import { Plan, Prisma, SubStatus } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

const subscriptionSelect = {
  id: true,
  plan: true,
  status: true,
  startDate: true,
  endDate: true,
  pendingPlan: true,
  pendingPlanAt: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
      plan: true,
    },
  },
} satisfies Prisma.SubscriptionSelect

export type GetSubscriptionItem = Prisma.SubscriptionGetPayload<{
  select: typeof subscriptionSelect
}>

export type GetSubscriptionItemSerialized = DecimalToNumber<GetSubscriptionItem>

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  description: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
      plan: true,
    },
  },
} satisfies Prisma.TransactionSelect

export type GetTransactionItem = Prisma.TransactionGetPayload<{
  select: typeof transactionSelect
}>

export type GetTransactionItemSerialized = DecimalToNumber<GetTransactionItem>

export interface GetTransactionsResponse {
  data: GetTransactionItemSerialized[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStoreSubscriptions(
  ownerId: string,
): Promise<GetSubscriptionItemSerialized[]> {
  try {
    return serializeDecimal(
      await prisma.subscription.findMany({
        where: {
          store: { ownerId },
        },
        select: subscriptionSelect,
        orderBy: { createdAt: 'desc' },
      }),
    )
  } catch {
    return []
  }
}

export async function getStoreSubscription(
  storeId: string,
): Promise<GetSubscriptionItemSerialized | null> {
  if (!storeId) {
    return null
  }

  return serializeDecimal(
    await prisma.subscription.findUnique({
      where: { storeId },
      select: subscriptionSelect,
    }),
  )
}

export async function cancelSubscription(storeId: string) {
  if (!storeId) {
    throw new Error('ไม่พบ Store ID')
  }

  const subscription = await prisma.subscription.findUnique({
    where: { storeId },
    select: { id: true, plan: true, status: true, endDate: true },
  })

  if (!subscription) {
    throw new Error('ไม่พบข้อมูล Subscription')
  }

  if (subscription.plan === Plan.FREE) {
    throw new Error('ไม่สามารถยกเลิกแพลนฟรีได้')
  }

  if (subscription.status === SubStatus.CANCELED) {
    throw new Error('Subscription ถูกยกเลิกไปแล้ว')
  }

  return serializeDecimal(
    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { plan: Plan.FREE },
      }),
      prisma.subscription.update({
        where: { storeId },
        data: {
          status: SubStatus.CANCELED,
          pendingPlan: Plan.FREE,
          pendingPlanAt: subscription.endDate ?? new Date(),
        },
      }),
    ]),
  )
}

export async function changePlan(storeId: string, newPlan: Plan) {
  if (!storeId) {
    throw new Error('ไม่พบ Store ID')
  }

  const subscription = await prisma.subscription.findUnique({
    where: { storeId },
    select: { id: true, plan: true, endDate: true, status: true },
  })

  if (!subscription) {
    throw new Error('ไม่พบข้อมูล Subscription')
  }

  const isUpgrade = PLAN_RANK[newPlan] > PLAN_RANK[subscription.plan]
  const isSamePlan = newPlan === subscription.plan
  const isCanceled = subscription.status === SubStatus.CANCELED

  if (isSamePlan && !isCanceled) {
    throw new Error('คุณใช้แพลนนี้อยู่แล้ว')
  }

  if (isUpgrade || isCanceled) {
    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { plan: newPlan },
      }),
      prisma.subscription.update({
        where: { storeId },
        data: {
          plan: newPlan,
          status: SubStatus.ACTIVE,
          pendingPlan: null,
          pendingPlanAt: null,
        },
      }),
    ])

    return {
      effective: 'immediate',
      message: `เปลี่ยนแพลนเป็น ${newPlan} เรียบร้อยแล้ว`,
    }
  } else {
    await prisma.subscription.update({
      where: { storeId },
      data: {
        pendingPlan: newPlan,
        pendingPlanAt: subscription.endDate,
      },
    })

    return {
      effective: 'end_of_cycle',
      effectiveDate: subscription.endDate,
      message: `จะลดแพลนเป็น ${newPlan} เมื่อรอบปัจจุบันสิ้นสุด`,
    }
  }
}

export async function getTransactions({
  ownerId,
  storeId,
  page = 1,
  limit = 10,
}: {
  ownerId: string
  storeId?: string
  page?: number
  limit?: number
}): Promise<GetTransactionsResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.TransactionWhereInput = {
      store: { ownerId },
    }

    if (storeId) {
      whereClause.storeId = storeId
    }

    const [totalItems, transactions] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: transactionSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(transactions),
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch {
    return {
      data: [],
      meta: {
        currentPage: page,
        limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}
