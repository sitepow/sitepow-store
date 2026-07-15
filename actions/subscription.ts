'use server'

import { PLAN_DETAILS, PLAN_RANK } from '@/constants/plan'
import { PRICING_VALUE } from '@/constants/pricing'
import {
  ActorType,
  InvoiceStatus,
  LogAction,
  Plan,
  Prisma,
  StoreStatus,
  SubStatus,
} from '@/generated/prisma/client'
import { CheckoutType, UpgradeType } from '@/types/checkout'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { calculatePlanPrice, calculateProration } from '@/utils/pricing'
import { differenceInMonths } from 'date-fns'

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
  pendingPlanCycle: true,
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
      select: {
        id: true,
        plan: true,
        endDate: true,
        startDate: true,
        status: true,
      },
    })

    if (!subscription) {
      return { success: false, message: 'ไม่พบข้อมูล Subscription' }
    }

    const monthsDiff = Math.max(
      1,
      Math.round(
        differenceInMonths(
          new Date(subscription.endDate),
          new Date(subscription.startDate),
        ),
      ),
    )
    const currentBillingCycle =
      monthsDiff >= 12
        ? PRICING_VALUE.TWELVE_MONTHS
        : monthsDiff >= 6
          ? PRICING_VALUE.SIX_MONTHS
          : monthsDiff >= 3
            ? PRICING_VALUE.THREE_MONTHS
            : PRICING_VALUE.ONE_MONTH

    if (subscription.plan === newPlan && currentBillingCycle === billingCycle) {
      return {
        success: false,
        message: 'คุณกำลังใช้งานแพลนและรอบบิลนี้อยู่แล้ว',
      }
    }

    const isFreePlan = newPlan === Plan.FREE
    const { finalPrice: newPlanPrice } = isFreePlan
      ? { finalPrice: 0 }
      : calculatePlanPrice(PLAN_DETAILS[newPlan].price.toString(), billingCycle)

    const months = parseInt(billingCycle) || 1
    const nextEndDate = new Date()
    nextEndDate.setMonth(nextEndDate.getMonth() + months)

    const unpaidInvoice = await prisma.subscriptionInvoice.findFirst({
      where: { storeId, status: InvoiceStatus.UNPAID },
      orderBy: { createdAt: 'desc' },
    })

    const isUpgrade = PLAN_RANK[newPlan] > PLAN_RANK[subscription.plan]

    const canChangeImmediately =
      (!!unpaidInvoice ||
        isUpgrade ||
        subscription.status === SubStatus.CANCELED) &&
      !isFreePlan

    if (canChangeImmediately) {
      const transactionOps = [
        prisma.store.update({
          where: { id: storeId },
          data: { plan: newPlan, status: StoreStatus.ACTIVE },
        }),
        prisma.subscription.update({
          where: { storeId },
          data: {
            plan: newPlan,
            status: SubStatus.ACTIVE,
            endDate: nextEndDate,
            pendingPlan: null,
            pendingPlanAt: null,
            pendingPlanCycle: null,
          },
        }),
        prisma.subscriptionInvoice.create({
          data: {
            storeId,
            plan: newPlan,
            amount: newPlanPrice,
            status: isFreePlan ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
            paidAt: isFreePlan ? new Date() : null,
            periodStart: new Date(),
            periodEnd: nextEndDate,
            description: isFreePlan
              ? 'แพลนเริ่มต้นใช้งานฟรี'
              : `ค่าบริการแพลน ${newPlan} (${billingCycle})`,
          },
        }),
      ]

      if (unpaidInvoice) {
        transactionOps.unshift(
          prisma.subscriptionInvoice.delete({
            where: { id: unpaidInvoice.id },
          }),
        )
      }

      await prisma.$transaction(transactionOps)

      await createLog({
        action: LogAction.CHANGE_PLAN,
        actorType: ActorType.MERCHANT,
        storeId,
        entity: 'Subscription',
        entityId: storeId,
        details: {
          from: subscription.plan,
          to: newPlan,
          type: 'immediate',
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
          pendingPlanCycle: billingCycle,
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
          cycle: billingCycle,
        },
      })

      return {
        success: true,
        message: `ตั้งค่าเปลี่ยนแพลนเป็น ${newPlan} (${billingCycle}) เมื่อรอบปัจจุบันสิ้นสุดแล้ว`,
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

export async function calculateUpgradeCost(
  storeId: string,
  newPlan: Plan,
  billingCycle: string,
) {
  const sub = await prisma.subscription.findUnique({
    where: { storeId },
    select: { startDate: true, endDate: true, plan: true },
  })

  if (!sub || sub.plan === newPlan) {
    return { amountToPay: 0 }
  }

  const lastInvoice = await prisma.subscriptionInvoice.findFirst({
    where: { storeId, status: InvoiceStatus.PAID },
    orderBy: { createdAt: 'desc' },
  })

  if (!lastInvoice) {
    return { amountToPay: 0 }
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

  return { amountToPay: Math.max(0, amountToPay) }
}

export async function cancelPendingPlanChange(storeId: string) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    await prisma.subscription.update({
      where: { storeId },
      data: {
        pendingPlan: null,
        pendingPlanAt: null,
        pendingPlanCycle: null,
      },
    })

    await createLog({
      action: LogAction.CHANGE_PLAN,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Subscription',
      entityId: storeId,
      details: {
        message: 'ยกเลิกการรอเปลี่ยนแพลนแล้ว',
      },
    })

    return { success: true, message: 'ยกเลิกการรอเปลี่ยนแพลนเรียบร้อยแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
