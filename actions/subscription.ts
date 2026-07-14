'use server'

import { PLAN_DETAILS, PLAN_RANK } from '@/constants/plan'
import { PRICING_VALUE } from '@/constants/pricing'
import {
  ActorType,
  InvoiceStatus,
  LogAction,
  Plan,
  Prisma,
  SubStatus,
} from '@/generated/prisma/client'
import { CheckoutType, UpgradeType } from '@/types/checkout'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { calculatePlanPrice, calculateProration } from '@/utils/pricing'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

import { createCheckoutSession } from './stripe/checkout'

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
      subscriptionInvoices: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
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

export async function initiatePlanUpgrade(
  storeId: string,
  newPlan: Plan,
  billingCycle: string,
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { storeId },
      select: { plan: true, startDate: true, endDate: true },
    })

    const isUpgrade = PLAN_RANK[newPlan] > PLAN_RANK[subscription!.plan]

    if (!isUpgrade) {
      return { success: true, url: null, type: UpgradeType.NORMAL }
    }

    const sub = await prisma.subscription.findUnique({
      where: { storeId },
      select: { startDate: true, endDate: true },
    })

    const lastInvoice = await prisma.subscriptionInvoice.findFirst({
      where: { storeId, status: InvoiceStatus.PAID },
      orderBy: { createdAt: 'desc' },
      select: { amount: true },
      take: 1,
    })

    if (!sub || !lastInvoice) {
      return { success: false, message: 'ไม่พบข้อมูลการชำระเงินเดิม' }
    }

    const { finalPrice: newPlanPrice } = calculatePlanPrice(
      PLAN_DETAILS[newPlan].price.toString(),
      billingCycle,
    )

    const { amountToPay } = calculateProration(
      {
        startDate: sub.startDate,
        endDate: sub.endDate,
        amountPaid: Number(lastInvoice.amount),
      },
      newPlanPrice,
    )

    if (amountToPay > 0) {
      const session = await createCheckoutSession({
        amount: Number(amountToPay),
        description: `ชำระส่วนต่างสำหรับ Upgrade ไปยังแพลน ${PLAN_DETAILS[newPlan].name}`,
        successUrl: `${process.env.APP_URL}/merchant/billing-subscription`,
        cancelUrl: `${process.env.APP_URL}/merchant/billing-subscription`,
        metadata: {
          type: CheckoutType.UPGRADE,
          storeId,
          newPlan,
          billingCycle,
        },
      })

      if (session?.success) {
        return { success: true, url: session.url, type: UpgradeType.UPGRADE }
      }
    }

    return { success: true, url: null }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
