'use server'

import { THAI_MONTHS } from '@/constants/system'
import { OrderStatus } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'
import { getThaiBoundary } from '@/utils/date'

import { getCurrentUser } from '@/lib/auth-server'
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
    dailyCOGS: number
    dailyGrossProfit: number
    dailyGrossMargin: number
    monthlyCOGS: number
    monthlyGrossProfit: number
    monthlyGrossProfitLastMonth: number
    monthlyGrossMargin: number
    yearlyCOGS: number
    yearlyGrossProfit: number
    yearlyGrossProfitLastYear: number
    yearlyGrossMargin: number
    dailyExpense: number
    monthlyExpense: number
    monthlyExpenseLastMonth: number
    yearlyExpense: number
    yearlyExpenseLastYear: number
    dailyNetProfit: number
    dailyNetProfitYesterday: number
    monthlyNetProfit: number
    monthlyNetProfitLastMonth: number
    monthlyNetMargin: number
    yearlyNetProfit: number
    yearlyNetProfitLastYear: number
    yearlyNetMargin: number
    dailyProfit: number
    dailyProfitYesterday: number
    dailyMargin: number
    monthlyProfit: number
    monthlyProfitLastMonth: number
    monthlyMargin: number
    yearlyProfit: number
    yearlyProfitLastYear: number
    yearlyMargin: number
  }
  salesTrend: { name: string; total: number }[]
  recentSales: {
    id: string
    name: string
    email: string
    amount: number
    createdAt: Date
  }[]
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
    dailyCOGS: 0,
    dailyGrossProfit: 0,
    dailyGrossMargin: 0,
    monthlyCOGS: 0,
    monthlyGrossProfit: 0,
    monthlyGrossProfitLastMonth: 0,
    monthlyGrossMargin: 0,
    yearlyCOGS: 0,
    yearlyGrossProfit: 0,
    yearlyGrossProfitLastYear: 0,
    yearlyGrossMargin: 0,
    dailyExpense: 0,
    monthlyExpense: 0,
    monthlyExpenseLastMonth: 0,
    yearlyExpense: 0,
    yearlyExpenseLastYear: 0,
    dailyNetProfit: 0,
    dailyNetProfitYesterday: 0,
    monthlyNetProfit: 0,
    monthlyNetProfitLastMonth: 0,
    monthlyNetMargin: 0,
    yearlyNetProfit: 0,
    yearlyNetProfitLastYear: 0,
    yearlyNetMargin: 0,
    dailyProfit: 0,
    dailyProfitYesterday: 0,
    dailyMargin: 0,
    monthlyProfit: 0,
    monthlyProfitLastMonth: 0,
    monthlyMargin: 0,
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
  const userSession = await getCurrentUser()
  const userId = userSession?.id

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

    const orderItemBranchFilter = validBranchId
      ? { branchId: validBranchId }
      : {}

    const expenseBranchFilter = validBranchId
      ? {
          OR: [{ branchId: validBranchId }, { branchId: null }],
        }
      : {}

    const stockBranchFilter = validBranchId ? { branchId: validBranchId } : {}

    const now = new Date()
    const thaiFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })

    const parts = thaiFormatter.formatToParts(now)
    const thaiYear = Number(parts.find((p) => p.type === 'year')?.value)
    const thaiMonth = Number(parts.find((p) => p.type === 'month')?.value) - 1
    const thaiDay = Number(parts.find((p) => p.type === 'day')?.value)

    const startOfToday = getThaiBoundary(
      thaiYear,
      thaiMonth,
      thaiDay,
      0,
      0,
      0,
      0,
    )
    const endOfToday = getThaiBoundary(
      thaiYear,
      thaiMonth,
      thaiDay,
      23,
      59,
      59,
      999,
    )
    const startOfYesterday = getThaiBoundary(
      thaiYear,
      thaiMonth,
      thaiDay - 1,
      0,
      0,
      0,
      0,
    )
    const endOfYesterday = getThaiBoundary(
      thaiYear,
      thaiMonth,
      thaiDay - 1,
      23,
      59,
      59,
      999,
    )
    const startOfThisMonth = getThaiBoundary(thaiYear, thaiMonth, 1, 0, 0, 0, 0)
    const endOfThisMonth = getThaiBoundary(
      thaiYear,
      thaiMonth + 1,
      0,
      23,
      59,
      59,
      999,
    )
    const startOfLastMonth = getThaiBoundary(
      thaiYear,
      thaiMonth - 1,
      1,
      0,
      0,
      0,
      0,
    )
    const endOfLastMonth = getThaiBoundary(
      thaiYear,
      thaiMonth,
      0,
      23,
      59,
      59,
      999,
    )

    const startOfThisYear = getThaiBoundary(thaiYear, 0, 1, 0, 0, 0, 0)
    const endOfThisYear = getThaiBoundary(thaiYear, 11, 31, 23, 59, 59, 999)
    const startOfLastYear = getThaiBoundary(thaiYear - 1, 0, 1, 0, 0, 0, 0)
    const endOfLastYear = getThaiBoundary(thaiYear - 1, 11, 31, 23, 59, 59, 999)
    const sixMonthsAgo = getThaiBoundary(thaiYear, thaiMonth - 5, 1, 0, 0, 0, 0)

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
      cogsToday,
      cogsYesterday,
      cogsThisMonth,
      cogsLastMonth,
      cogsThisYear,
      cogsLastYear,
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
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...storeFilter,
            createdAt: { gte: startOfToday, lte: endOfToday },
            status: { not: OrderStatus.CANCELLED },
          },
          ...orderItemBranchFilter,
        },
        _sum: { costPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...storeFilter,
            createdAt: { gte: startOfYesterday, lte: endOfYesterday },
            status: { not: OrderStatus.CANCELLED },
          },
          ...orderItemBranchFilter,
        },
        _sum: { costPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...storeFilter,
            createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
            status: { not: OrderStatus.CANCELLED },
          },
          ...orderItemBranchFilter,
        },
        _sum: { costPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...storeFilter,
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
            status: { not: OrderStatus.CANCELLED },
          },
          ...orderItemBranchFilter,
        },
        _sum: { costPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...storeFilter,
            createdAt: { gte: startOfThisYear, lte: endOfThisYear },
            status: { not: OrderStatus.CANCELLED },
          },
          ...orderItemBranchFilter,
        },
        _sum: { costPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...storeFilter,
            createdAt: { gte: startOfLastYear, lte: endOfLastYear },
            status: { not: OrderStatus.CANCELLED },
          },
          ...orderItemBranchFilter,
        },
        _sum: { costPrice: true },
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
          createdAt: true,
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
    const dCOGS = Number(cogsToday._sum.costPrice ?? 0)
    const dCOGSYesterday = Number(cogsYesterday._sum.costPrice ?? 0)
    const mCOGS = Number(cogsThisMonth._sum.costPrice ?? 0)
    const mCOGSLastMonth = Number(cogsLastMonth._sum.costPrice ?? 0)
    const yCOGS = Number(cogsThisYear._sum.costPrice ?? 0)
    const yCOGSLastYear = Number(cogsLastYear._sum.costPrice ?? 0)
    const dExpense = Number(expenseToday._sum.amount ?? 0)
    const dExpenseYesterday = Number(expenseYesterday._sum.amount ?? 0)
    const mExpense = Number(expenseThisMonth._sum.amount ?? 0)
    const mExpenseLastMonth = Number(expenseLastMonth._sum.amount ?? 0)
    const yExpense = Number(expenseThisYear._sum.amount ?? 0)
    const yExpenseLastYear = Number(expenseLastYear._sum.amount ?? 0)
    const dGrossProfit = dSales - dCOGS
    const mGrossProfit = mRevenue - mCOGS
    const mGrossProfitLastMonth = mRevenueLastMonth - mCOGSLastMonth
    const yGrossProfit = yRevenue - yCOGS
    const yGrossProfitLastYear = yRevenueLastYear - yCOGSLastYear
    const dNetProfit = dGrossProfit - dExpense
    const dNetProfitYesterday =
      dSalesYesterday - dCOGSYesterday - dExpenseYesterday
    const mNetProfit = mGrossProfit - mExpense
    const mNetProfitLastMonth = mGrossProfitLastMonth - mExpenseLastMonth
    const yNetProfit = yGrossProfit - yExpense
    const yNetProfitLastYear = yGrossProfitLastYear - yExpenseLastYear
    const trendMap: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(thaiYear, thaiMonth - i, 1))
      trendMap[`${d.getUTCFullYear()}-${d.getUTCMonth()}`] = 0
    }

    for (const order of salesTrendRaw) {
      const orderDate = new Date(order.createdAt)
      const orderThaiYear = Number(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
        }).format(orderDate),
      )
      const orderThaiMonth =
        Number(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Bangkok',
            month: 'numeric',
          }).format(orderDate),
        ) - 1

      const key = `${orderThaiYear}-${orderThaiMonth}`
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
        dailyCOGS: dCOGS,
        dailyGrossProfit: dGrossProfit,
        dailyGrossMargin: calcMargin(dGrossProfit, dSales),
        monthlyCOGS: mCOGS,
        monthlyGrossProfit: mGrossProfit,
        monthlyGrossProfitLastMonth: mGrossProfitLastMonth,
        monthlyGrossMargin: calcMargin(mGrossProfit, mRevenue),
        yearlyCOGS: yCOGS,
        yearlyGrossProfit: yGrossProfit,
        yearlyGrossProfitLastYear: yGrossProfitLastYear,
        yearlyGrossMargin: calcMargin(yGrossProfit, yRevenue),
        dailyExpense: dExpense,
        monthlyExpense: mExpense,
        monthlyExpenseLastMonth: mExpenseLastMonth,
        yearlyExpense: yExpense,
        yearlyExpenseLastYear: yExpenseLastYear,
        dailyNetProfit: dNetProfit,
        dailyNetProfitYesterday: dNetProfitYesterday,
        monthlyNetProfit: mNetProfit,
        monthlyNetProfitLastMonth: mNetProfitLastMonth,
        monthlyNetMargin: calcMargin(mNetProfit, mRevenue),
        yearlyNetProfit: yNetProfit,
        yearlyNetProfitLastYear: yNetProfitLastYear,
        yearlyNetMargin: calcMargin(yNetProfit, yRevenue),
        dailyProfit: dNetProfit,
        dailyProfitYesterday: dNetProfitYesterday,
        dailyMargin: calcMargin(dNetProfit, dSales),
        monthlyProfit: mNetProfit,
        monthlyProfitLastMonth: mNetProfitLastMonth,
        monthlyMargin: calcMargin(mNetProfit, mRevenue),
        yearlyProfit: yNetProfit,
        yearlyProfitLastYear: yNetProfitLastYear,
        yearlyMargin: calcMargin(yNetProfit, yRevenue),
      },
      salesTrend,
      recentSales: recentOrdersRaw.map((o) => {
        const customerName = o.customer
          ? `${o.customer.firstName ?? ''} ${o.customer.lastName ?? ''}`.trim()
          : ''

        return {
          id: o.id,
          name: customerName || 'ลูกค้าไม่ทราบชื่อ',
          email: o.customer?.email ?? '-',
          amount: Number(o.totalAmount),
          createdAt: o.createdAt,
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
