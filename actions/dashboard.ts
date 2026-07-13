'use server'

import { THAI_MONTHS } from '@/constants/system'
import { OrderStatus } from '@/generated/prisma/enums'

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
  name: string
  inventory: { branchName: string; stock: number }[]
}

export interface GetDashboardResult {
  stats: GetDashboardStatsResult
  salesTrend: SalesTrendItem[]
  recentSales: RecentSaleItem[]
  lowStock: LowStockItem[]
}

export async function getDashboard(
  storeId: string,
): Promise<GetDashboardResult> {
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
        storeId,
        createdAt: { gte: startOfThisMonth },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        storeId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: { storeId, createdAt: { gte: startOfThisMonth } },
    }),
    prisma.order.count({
      where: {
        storeId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.order.aggregate({
      where: {
        storeId,
        createdAt: { gte: startOfToday },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        storeId,
        createdAt: { gte: startOfYesterday, lte: endOfYesterday },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalAmount: true },
    }),
    prisma.customerStore.count({
      where: { storeId, customer: { createdAt: { gte: startOfThisMonth } } },
    }),
    prisma.customerStore.count({
      where: {
        storeId,
        customer: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      },
    }),
    prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: sixMonthsAgo },
        status: { not: OrderStatus.CANCELLED },
      },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { storeId, status: { not: OrderStatus.CANCELLED } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        totalAmount: true,
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.productStock.findMany({
      where: {
        variant: { product: { storeId } },
        quantity: { lte: prisma.productStock.fields.minStock },
      },
      select: {
        quantity: true,
        minStock: true,
        branch: { select: { name: true } },
        variant: { select: { product: { select: { id: true, title: true } } } },
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
      ? [o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ') ||
        'ลูกค้า'
      : 'ลูกค้า',
    email: o.customer?.email ?? '-',
    amount: Number(o.totalAmount),
  }))

  const lowStockMap: Record<string, LowStockItem> = {}
  for (const stock of lowStockRaw) {
    const productId = stock.variant.product.id
    if (!lowStockMap[productId]) {
      lowStockMap[productId] = {
        id: productId,
        name: stock.variant.product.title,
        inventory: [],
      }
    }
    lowStockMap[productId].inventory.push({
      branchName: stock.branch.name,
      stock: stock.quantity,
    })
  }

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
    lowStock: Object.values(lowStockMap),
  }
}
