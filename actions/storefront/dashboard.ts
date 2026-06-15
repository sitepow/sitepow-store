'use server'

import { auth } from '@/auth'
import { OrderStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export interface GetStorefrontDashboardStats {
  totalSpent: number
  rewardPoints: number
  totalOrders: number
  pendingOrders: number
  availableCoupons: number
}

export interface SpendingTrendItem {
  name: string
  total: number
}

export interface PointsHistoryItem {
  name: string
  earned: number
  used: number
}

export interface GetStorefrontDashboardResult {
  stats: GetStorefrontDashboardStats
  spendingTrend: SpendingTrendItem[]
  pointsHistory: PointsHistoryItem[]
}

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

const EMPTY_RESULT: GetStorefrontDashboardResult = {
  stats: {
    totalSpent: 0,
    rewardPoints: 0,
    totalOrders: 0,
    pendingOrders: 0,
    availableCoupons: 0,
  },
  spendingTrend: [],
  pointsHistory: [],
}

export async function getStorefrontDashboard(
  storeSlug: string,
): Promise<GetStorefrontDashboardResult> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return EMPTY_RESULT
    }

    const [customer, store] = await Promise.all([
      prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      }),
      prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true },
      }),
    ])

    if (!customer || !store) {
      return EMPTY_RESULT
    }

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [customerStore, totalOrders, pendingOrders, coupons, ordersTrendRaw] =
      await Promise.all([
        prisma.customerStore.findUnique({
          where: {
            customerId_storeId: {
              customerId: customer.id,
              storeId: store.id,
            },
          },
          select: { totalSpent: true, rewardPoints: true },
        }),
        prisma.order.count({
          where: { customerId: customer.id, storeId: store.id },
        }),
        prisma.order.count({
          where: {
            customerId: customer.id,
            storeId: store.id,
            status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
          },
        }),
        prisma.coupon.findMany({
          where: {
            storeId: store.id,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          select: { usageLimit: true, usedCount: true },
        }),
        prisma.order.findMany({
          where: {
            customerId: customer.id,
            storeId: store.id,
            createdAt: { gte: sixMonthsAgo },
            status: { not: OrderStatus.CANCELLED },
          },
          select: {
            totalAmount: true,
            earnedPoints: true,
            usedPoints: true,
            createdAt: true,
          },
        }),
      ])

    const availableCoupons = coupons.filter(
      (c) => c.usageLimit === null || c.usedCount < c.usageLimit,
    ).length

    const spendingMap: Record<string, number> = {}
    const pointsMap: Record<string, { earned: number; used: number }> = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      spendingMap[key] = 0
      pointsMap[key] = { earned: 0, used: 0 }
    }

    for (const order of ordersTrendRaw) {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`
      if (key in spendingMap) {
        spendingMap[key] += Number(order.totalAmount)
        pointsMap[key].earned += order.earnedPoints ?? 0
        pointsMap[key].used += order.usedPoints ?? 0
      }
    }

    const spendingTrend: SpendingTrendItem[] = Object.entries(spendingMap).map(
      ([key, total]) => {
        const month = Number(key.split('-')[1])
        return { name: THAI_MONTHS[month], total: Math.round(total) }
      },
    )

    const pointsHistory: PointsHistoryItem[] = Object.entries(pointsMap).map(
      ([key, value]) => {
        const month = Number(key.split('-')[1])
        return {
          name: THAI_MONTHS[month],
          earned: value.earned,
          used: value.used,
        }
      },
    )

    return {
      stats: {
        totalSpent: Number(customerStore?.totalSpent ?? 0),
        rewardPoints: customerStore?.rewardPoints ?? 0,
        totalOrders,
        pendingOrders,
        availableCoupons,
      },
      spendingTrend,
      pointsHistory,
    }
  } catch (error) {
    console.error(error)
    return EMPTY_RESULT
  }
}
