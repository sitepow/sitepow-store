'use server'

import { THAI_MONTHS } from '@/constants/system'
import { OrderStatus } from '@/generated/prisma/enums'
import { getRecentMonths, getUtcYearMonthDay, toMonthKey } from '@/utils/formatting/date'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

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
    const { year: utcYear, month: utcMonth } = getUtcYearMonthDay(now)
    const sixMonthsAgo = new Date(Date.UTC(utcYear, utcMonth - 5, 1))

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
            status: { notIn: [OrderStatus.SHIPPED, OrderStatus.CANCELLED] },
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
          orderBy: { createdAt: 'asc' },
        }),
      ])

    const availableCoupons = coupons.filter(
      (c) => c.usageLimit === null || c.usedCount < c.usageLimit,
    ).length

    const monthlyDataMap = new Map<
      string,
      { name: string; total: number; earned: number; used: number }
    >()

    for (const { key, month } of getRecentMonths(6, utcYear, utcMonth)) {
      monthlyDataMap.set(key, {
        name: THAI_MONTHS[month],
        total: 0,
        earned: 0,
        used: 0,
      })
    }

    for (const order of ordersTrendRaw) {
      const key = toMonthKey(
        order.createdAt.getUTCFullYear(),
        order.createdAt.getUTCMonth(),
      )
      const entry = monthlyDataMap.get(key)
      if (entry) {
        entry.total += Number(order.totalAmount)
        entry.earned += order.earnedPoints ?? 0
        entry.used += order.usedPoints ?? 0
      }
    }

    const spendingTrend: SpendingTrendItem[] = []
    const pointsHistory: PointsHistoryItem[] = []

    monthlyDataMap.forEach((value) => {
      spendingTrend.push({
        name: value.name,
        total: Math.round(value.total),
      })
      pointsHistory.push({
        name: value.name,
        earned: value.earned,
        used: value.used,
      })
    })

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
