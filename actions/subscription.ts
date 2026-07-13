'use server'

import { PLAN_RANK } from '@/constants/plan'
import { PRICING_VALUE } from '@/constants/pricing'
import {
  ActorType,
  LogAction,
  Plan,
  Prisma,
  SubStatus,
} from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
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

const subscriptionInvoiceSelect = {
  id: true,
  amount: true,
  status: true,
  plan: true,
  description: true,
  paidAt: true,
  periodStart: true,
  periodEnd: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
      plan: true,
    },
  },
} satisfies Prisma.SubscriptionInvoiceSelect

export type GetSubscriptionInvoiceItem = Prisma.SubscriptionInvoiceGetPayload<{
  select: typeof subscriptionInvoiceSelect
}>

export type GetSubscriptionInvoiceItemSerialized =
  DecimalToNumber<GetSubscriptionInvoiceItem>

export interface GetSubscriptionInvoicesResponse {
  data: GetSubscriptionInvoiceItemSerialized[]
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
    return { success: false, message: 'ไม่พบ Store ID' }
  }

  const subscription = await prisma.subscription.findUnique({
    where: { storeId },
    select: { id: true, plan: true, status: true, endDate: true },
  })

  if (!subscription) {
    return { success: false, message: 'ไม่พบข้อมูล Subscription' }
  }

  if (subscription.plan === Plan.FREE) {
    return { success: false, message: 'ไม่สามารถยกเลิกแพลนฟรีได้' }
  }

  if (subscription.status === SubStatus.CANCELED) {
    return { success: false, message: 'Subscription ถูกยกเลิกไปแล้ว' }
  }

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
  ])

  await createLog({
    action: LogAction.CHANGE_PLAN,
    actorType: ActorType.MERCHANT,
    storeId,
    entity: 'Subscription',
    entityId: storeId,
    details: { from: subscription.plan, to: Plan.FREE, reason: 'canceled' },
  })

  return { success: true, message: 'ยกเลิก Subscription สำเร็จแล้ว' }
}

export async function changePlan(
  storeId: string,
  newPlan: Plan,
  billingCycle: string = PRICING_VALUE.ONE_MONTH,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const subscription = await prisma.subscription.findUnique({
      where: { storeId },
      select: { id: true, plan: true, endDate: true, status: true },
    })

    if (!subscription) {
      return { success: false, message: 'ไม่พบข้อมูล Subscription' }
    }

    const months =
      billingCycle === PRICING_VALUE.TWELVE_MONTHS
        ? 12
        : billingCycle === PRICING_VALUE.SIX_MONTHS
          ? 6
          : billingCycle === PRICING_VALUE.THREE_MONTHS
            ? 3
            : 1

    const nextEndDate = new Date()
    nextEndDate.setMonth(nextEndDate.getMonth() + months)

    const isUpgrade = PLAN_RANK[newPlan] > PLAN_RANK[subscription.plan]
    const isSamePlan = newPlan === subscription.plan
    const isCanceled = subscription.status === SubStatus.CANCELED

    if (isSamePlan && !isCanceled) {
      return { success: false, message: 'คุณใช้แพลนนี้อยู่แล้ว' }
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
            endDate: nextEndDate,
            pendingPlan: null,
            pendingPlanAt: null,
          },
        }),
      ])

      await createLog({
        action: LogAction.CHANGE_PLAN,
        actorType: ActorType.MERCHANT,
        storeId,
        entity: 'Subscription',
        entityId: storeId,
        details: {
          from: subscription.plan,
          to: newPlan,
          type: 'upgrade',
          cycle: billingCycle,
        },
      })

      return {
        success: true,
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

      await createLog({
        action: LogAction.CHANGE_PLAN,
        actorType: ActorType.MERCHANT,
        storeId,
        entity: 'Subscription',
        entityId: storeId,
        details: {
          from: subscription.plan,
          to: newPlan,
          type: 'downgrade_pending',
        },
      })

      return {
        success: true,
        message: `ตั้งค่าลดแพลนเป็น ${newPlan} เมื่อรอบปัจจุบันสิ้นสุดแล้ว`,
      }
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getSubscriptionInvoices({
  ownerId,
  storeId,
  page = 1,
  limit = 10,
}: {
  ownerId: string
  storeId?: string
  page?: number
  limit?: number
}): Promise<GetSubscriptionInvoicesResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.SubscriptionInvoiceWhereInput = {
      store: { ownerId },
      ...(storeId ? { storeId } : {}),
    }

    const [totalItems, invoices] = await Promise.all([
      prisma.subscriptionInvoice.count({ where: whereClause }),
      prisma.subscriptionInvoice.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: subscriptionInvoiceSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(invoices),
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
