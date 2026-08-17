'use server'

import { THAI_MONTHS } from '@/constants/system'
import { OrderStatus } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface GetDashboardResult {
  stats: {
    totalRevenue: number
    totalRevenueLastMonth: number
    totalOrders: number
    totalOrdersLastMonth: number
    dailySales: number
    dailySalesYesterday: number
    newCustomers: number
    newCustomersLastMonth: number
    dailyExpense: number
    dailyProfit: number
    dailyProfitYesterday: number
    dailyMargin: number
    monthlyExpense: number
    monthlyExpenseLastMonth: number
    monthlyProfit: number
    monthlyProfitLastMonth: number
    monthlyMargin: number
    yearlyExpense: number
    yearlyExpenseLastYear: number
    yearlyProfit: number
    yearlyProfitLastYear: number
    yearlyMargin: number
  }
  salesTrend: { name: string; total: number }[]
  recentSales: { id: string; name: string; email: string; amount: number }[]
  lowStock: {
    id: string
    productName: string
    variantId: string
    variantTitle: string | null
    branchName: string
    stock: number
    minStock: number
  }[]
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
    dailyExpense: 0,
    dailyProfit: 0,
    dailyProfitYesterday: 0,
    dailyMargin: 0,
    monthlyExpense: 0,
    monthlyExpenseLastMonth: 0,
    monthlyProfit: 0,
    monthlyProfitLastMonth: 0,
    monthlyMargin: 0,
    yearlyExpense: 0,
    yearlyExpenseLastYear: 0,
    yearlyProfit: 0,
    yearlyProfitLastYear: 0,
    yearlyMargin: 0,
  },
  salesTrend: [],
  recentSales: [],
  lowStock: [],
}

const calcMargin = (profit: number, revenue: number): number => {
  if (!revenue || revenue === 0) {
    return 0
  }
  return Math.round((profit / revenue) * 1000) / 10
}

export async function getDashboard(
  storeId: string,
  branchId?: string,
): Promise<GetDashboardResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId || !storeId || storeId === ALL_STORES) {
    return emptyDashboardResult
  }

  try {
    const validBranchId =
      branchId && branchId !== ALL_BRANCHES ? branchId : undefined

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewDashboard',
      branchId: validBranchId,
    })

    if (!authCheck.isAuthorized) {
      return emptyDashboardResult
    }

    const storeFilter = { storeId }

    const orderBranchFilter = validBranchId
      ? { items: { some: { branchId: validBranchId } } }
      : {}

    const expenseBranchFilter = validBranchId
      ? {
          OR: [{ branchId: validBranchId }, { branchId: null }],
        }
      : {}

    const stockBranchFilter = validBranchId ? { branchId: validBranchId } : {}

    const now = new Date()

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
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
      999,
    )

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    )

    const startOfThisYear = new Date(now.getFullYear(), 0, 1)
    const endOfThisYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1)
    const endOfLastYear = new Date(
      now.getFullYear() - 1,
      11,
      31,
      23,
      59,
      59,
      999,
    )

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [
      salesToday,
      salesYesterday,
      revenueThisMonth,
      revenueLastMonth,
      revenueThisYear,
      revenueLastYear,
      ordersThisMonth,
      ordersLastMonth,
      customersThisMonth,
      customersLastMonth,

      expenseToday,
      expenseYesterday,
      expenseThisMonth,
      expenseLastMonth,
      expenseThisYear,
      expenseLastYear,

      salesTrendRaw,
      recentOrdersRaw,
      lowStockRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfToday, lte: endOfToday },
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
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
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
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfThisYear, lte: endOfThisYear },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfLastYear, lte: endOfLastYear },
          status: { not: OrderStatus.CANCELLED },
          ...orderBranchFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          ...storeFilter,
          createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
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

      prisma.expense.aggregate({
        where: {
          ...storeFilter,
          expenseDate: { gte: startOfToday, lte: endOfToday },
          ...expenseBranchFilter,
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          ...storeFilter,
          expenseDate: { gte: startOfYesterday, lte: endOfYesterday },
          ...expenseBranchFilter,
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          ...storeFilter,
          expenseDate: { gte: startOfThisMonth, lte: endOfThisMonth },
          ...expenseBranchFilter,
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          ...storeFilter,
          expenseDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          ...expenseBranchFilter,
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          ...storeFilter,
          expenseDate: { gte: startOfThisYear, lte: endOfThisYear },
          ...expenseBranchFilter,
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          ...storeFilter,
          expenseDate: { gte: startOfLastYear, lte: endOfLastYear },
          ...expenseBranchFilter,
        },
        _sum: { amount: true },
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
          variant: { product: { storeId } },
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

    const dSales = Number(salesToday._sum.totalAmount ?? 0)
    const dSalesYesterday = Number(salesYesterday._sum.totalAmount ?? 0)
    const mRevenue = Number(revenueThisMonth._sum.totalAmount ?? 0)
    const mRevenueLastMonth = Number(revenueLastMonth._sum.totalAmount ?? 0)
    const yRevenue = Number(revenueThisYear._sum.totalAmount ?? 0)
    const yRevenueLastYear = Number(revenueLastYear._sum.totalAmount ?? 0)

    const dExpense = Number(expenseToday._sum.amount ?? 0)
    const dExpenseYesterday = Number(expenseYesterday._sum.amount ?? 0)
    const mExpense = Number(expenseThisMonth._sum.amount ?? 0)
    const mExpenseLastMonth = Number(expenseLastMonth._sum.amount ?? 0)
    const yExpense = Number(expenseThisYear._sum.amount ?? 0)
    const yExpenseLastYear = Number(expenseLastYear._sum.amount ?? 0)

    const dProfit = dSales - dExpense
    const dProfitYesterday = dSalesYesterday - dExpenseYesterday

    const mProfit = mRevenue - mExpense
    const mProfitLastMonth = mRevenueLastMonth - mExpenseLastMonth

    const yProfit = yRevenue - yExpense
    const yProfitLastYear = yRevenueLastYear - yExpenseLastYear

    const dMargin = calcMargin(dProfit, dSales)
    const mMargin = calcMargin(mProfit, mRevenue)
    const yMargin = calcMargin(yProfit, yRevenue)

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
    const salesTrend = Object.entries(trendMap).map(([key, total]) => {
      const [, month] = key.split('-').map(Number)
      return { name: THAI_MONTHS[month], total: Math.round(total) }
    })

    return {
      stats: {
        totalRevenue: mRevenue,
        totalRevenueLastMonth: mRevenueLastMonth,
        totalOrders: ordersThisMonth,
        totalOrdersLastMonth: ordersLastMonth,
        dailySales: dSales,
        dailySalesYesterday: dSalesYesterday,
        newCustomers: customersThisMonth,
        newCustomersLastMonth: customersLastMonth,

        dailyExpense: dExpense,
        dailyProfit: dProfit,
        dailyProfitYesterday: dProfitYesterday,
        dailyMargin: dMargin,
        monthlyExpense: mExpense,
        monthlyExpenseLastMonth: mExpenseLastMonth,
        monthlyProfit: mProfit,
        monthlyProfitLastMonth: mProfitLastMonth,
        monthlyMargin: mMargin,
        yearlyExpense: yExpense,
        yearlyExpenseLastYear: yExpenseLastYear,
        yearlyProfit: yProfit,
        yearlyProfitLastYear: yProfitLastYear,
        yearlyMargin: yMargin,
      },
      salesTrend,
      recentSales: recentOrdersRaw.map((o) => {
        const customerName = o.customer
          ? `${o.customer.firstName ?? ''} ${o.customer.lastName ?? ''}`.trim()
          : ''

        return {
          id: o.id,
          name: customerName || 'ลูกค้า',
          email: o.customer?.email ?? '-',
          amount: Number(o.totalAmount),
        }
      }),
      lowStock: lowStockRaw.map((stock) => ({
        id: `${stock.variant.product.id}-${stock.variant.title ?? 'default'}-${stock.branch.name}`,
        productName: stock.variant.product.title,
        variantId: stock.variant.id,
        variantTitle: stock.variant.title,
        branchName: stock.branch.name,
        stock: stock.quantity,
        minStock: stock.minStock,
      })),
    }
  } catch (error) {
    console.error(error)
    return emptyDashboardResult
  }
}
