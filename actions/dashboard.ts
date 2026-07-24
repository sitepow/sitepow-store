'use server'

import { THAI_MONTHS } from '@/constants/system'
import { OrderStatus } from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'

import { auth } from '@/lib/auth'
import { verifyStaffPermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export interface GetDashboardStatsResult {
  totalRevenue: number
  totalRevenueLastMonth: number
  totalOrders: number
  totalOrdersLastMonth: number
  dailySales: number
  dailySalesYesterday: number
  newCustomers: number
  newCustomersLastMonth: number
}

export interface SalesTrendItem {
  name: string
  total: number
}

export interface RecentSaleItem {
  id: string
  name: string
  email: string
  amount: number
}

export interface LowStockItem {
  id: string
  productName: string
  variantId: string
  variantTitle: string | null
  branchName: string
  stock: number
  minStock: number
}

export interface GetDashboardResult {
  stats: GetDashboardStatsResult
  salesTrend: SalesTrendItem[]
  recentSales: RecentSaleItem[]
  lowStock: LowStockItem[]
}

const emptyDashboardResult: GetDashboardResult = {
  stats: {
    totalRevenue: 0,
    totalRevenueLastMonth: 0,
    totalOrders: 0,
    totalOrdersLastMonth: 0,
    dailySales: 0,
    dailySalesYesterday: 0,
    newCustomers: 0,
    newCustomersLastMonth: 0,
  },
  salesTrend: [],
  recentSales: [],
  lowStock: [],
}

export async function getDashboard(
  storeId: string,
  branchId?: string,
): Promise<GetDashboardResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return emptyDashboardResult
  }

  try {
    let targetStoreIds: string[] = []

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyStaffPermission({
        userId,
        storeId,
        permission: 'canManageOrders',
      })

      if (!authCheck.isAuthorized) {
        return emptyDashboardResult
      }

      targetStoreIds = [storeId]
    } else {
      const userStores = await prisma.store.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { StaffStore: { some: { staff: { userId } } } },
          ],
        },
        select: { id: true },
      })

      targetStoreIds = userStores.map((s) => s.id)
    }

    if (targetStoreIds.length === 0) {
      return emptyDashboardResult
    }

    const now = new Date()

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    )

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
    const startOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    )
    const endOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      23,
      59,
      59,
    )

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const storeFilter = { storeId: { in: targetStoreIds } }

    const orderBranchFilter =
      branchId && branchId !== ALL_STORES
        ? { items: { some: { branchId } } }
        : {}

    const stockBranchFilter =
      branchId && branchId !== ALL_STORES ? { branchId } : {}

    const [
      revenueThisMonth,
      revenueLastMonth,
      ordersThisMonth,
      ordersLastMonth,
      salesToday,
      salesYesterday,
      customersThisMonth,
      customersLastMonth,
      salesTrendRaw,
      recentOrdersRaw,
      lowStockRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfThisMonth },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfThisMonth },
          ...orderBranchFilter,
        },
      }),
      prisma.order.count({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          ...orderBranchFilter,
        },
      }),
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfToday },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfYesterday, lte: endOfYesterday },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.customerStore.count({
        where: {
          ...storeFilter,
          customer: { createdAt: { gte: startOfThisMonth } },
        },
      }),
      prisma.customerStore.count({
        where: {
          ...storeFilter,
          customer: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        },
      }),
      prisma.order.findMany({
        where: {
          ...storeFilter,
          createdAt: { gte: sixMonthsAgo },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          ...storeFilter,
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          totalAmount: true,
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.productStock.findMany({
        where: {
          variant: { product: { storeId: { in: targetStoreIds } } },
          quantity: { lte: prisma.productStock.fields.minStock },
          ...stockBranchFilter,
        },
        select: {
          quantity: true,
          minStock: true,
          branch: { select: { name: true } },
          variant: {
            select: {
              id: true,
              title: true,
              product: { select: { id: true, title: true } },
            },
          },
        },
        take: 10,
      }),
    ])

    const trendMap: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      trendMap[`${d.getFullYear()}-${d.getMonth()}`] = 0
    }
    for (const order of salesTrendRaw) {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`
      if (key in trendMap) {
        trendMap[key] += Number(order.totalAmount)
      }
    }
    const salesTrend: SalesTrendItem[] = Object.entries(trendMap).map(
      ([key, total]) => {
        const [year, month] = key.split('-').map(Number)
        return { name: THAI_MONTHS[month], total: Math.round(total) }
      },
    )

    const recentSales: RecentSaleItem[] = recentOrdersRaw.map((o) => ({
      id: o.id,
      name: o.customer
        ? [o.customer.firstName, o.customer.lastName]
            .filter(Boolean)
            .join(' ') || 'ลูกค้า'
        : 'ลูกค้า',
      email: o.customer?.email ?? '-',
      amount: Number(o.totalAmount),
    }))

    const lowStockList: LowStockItem[] = lowStockRaw.map((stock) => ({
      id: `${stock.variant.product.id}-${stock.variant.title ?? 'default'}-${stock.branch.name}`,
      productName: stock.variant.product.title,
      variantId: stock.variant.id,
      variantTitle: stock.variant.title,
      branchName: stock.branch.name,
      stock: stock.quantity,
      minStock: stock.minStock,
    }))

    return {
      stats: {
        totalRevenue: Number(revenueThisMonth._sum.totalAmount ?? 0),
        totalRevenueLastMonth: Number(revenueLastMonth._sum.totalAmount ?? 0),
        totalOrders: ordersThisMonth,
        totalOrdersLastMonth: ordersLastMonth,
        dailySales: Number(salesToday._sum.totalAmount ?? 0),
        dailySalesYesterday: Number(salesYesterday._sum.totalAmount ?? 0),
        newCustomers: customersThisMonth,
        newCustomersLastMonth: customersLastMonth,
      },
      salesTrend,
      recentSales,
      lowStock: lowStockList,
    }
  } catch (error) {
    console.error(error)
    return emptyDashboardResult
  }
}
