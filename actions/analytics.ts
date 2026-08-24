'use server'

import { OrderStatus } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface FinancialTrendItem {
  period: string
  revenue: number
  cogs: number
  expense: number
  netProfit: number
}

export interface DayOfWeekAnalysis {
  dayName: string
  dayIndex: number
  orderCount: number
  totalSales: number
}

export interface HeatmapCell {
  dayOfWeek: number
  hour: number
  count: number
  sales: number
}

export interface TopProductItem {
  name: string
  quantity: number
  totalSales: number
}

export interface TopVariantItem {
  name: string
  quantity: number
  totalSales: number
}

export interface AnalyticsResult {
  financialTrend: FinancialTrendItem[]
  dayOfWeekTrend: DayOfWeekAnalysis[]
  heatmap: HeatmapCell[]
  topBuyingHours: { hour: string; count: number }[]
  topProducts: TopProductItem[]
  topVariants: TopVariantItem[]
}

export async function getAnalyticsOverview(
  storeId: string,
  branchId?: string,
): Promise<AnalyticsResult> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId || !storeId || storeId === ALL_STORES) {
    return {
      financialTrend: [],
      dayOfWeekTrend: [],
      heatmap: [],
      topBuyingHours: [],
      topProducts: [],
      topVariants: [],
    }
  }

  const validBranchId =
    branchId && branchId !== ALL_BRANCHES ? branchId : undefined

  const authCheck = await verifyEmployeePermission({
    userId,
    storeId,
    permission: 'canViewDashboard',
    branchId: validBranchId,
  })

  if (!authCheck.isAuthorized) {
    return {
      financialTrend: [],
      dayOfWeekTrend: [],
      heatmap: [],
      topBuyingHours: [],
      topProducts: [],
      topVariants: [],
    }
  }

  const storeFilter = { storeId }
  const orderBranchFilter = validBranchId
    ? { items: { some: { branchId: validBranchId } } }
    : {}
  const orderItemBranchFilter = validBranchId ? { branchId: validBranchId } : {}
  const expenseBranchFilter = validBranchId
    ? { OR: [{ branchId: validBranchId }, { branchId: null }] }
    : {}

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [orders, orderItems, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...storeFilter,
        createdAt: { gte: sixMonthsAgo },
        status: { not: OrderStatus.CANCELLED },
        ...orderBranchFilter,
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          ...storeFilter,
          createdAt: { gte: sixMonthsAgo },
          status: { not: OrderStatus.CANCELLED },
        },
        ...orderItemBranchFilter,
      },
      select: {
        id: true,
        title: true,
        variantTitle: true,
        price: true,
        costPrice: true,
        quantity: true,
        order: { select: { createdAt: true } },
      },
    }),
    prisma.expense.findMany({
      where: {
        ...storeFilter,
        expenseDate: { gte: sixMonthsAgo },
        ...expenseBranchFilter,
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    }),
  ])

  const monthlyMap: Record<string, FinancialTrendItem> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('th-TH', {
      month: 'short',
      year: '2-digit',
    })
    monthlyMap[key] = {
      period: label,
      revenue: 0,
      cogs: 0,
      expense: 0,
      netProfit: 0,
    }
  }

  orders.forEach((o) => {
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key]) monthlyMap[key].revenue += Number(o.totalAmount)
  })

  orderItems.forEach((item) => {
    const key = `${item.order.createdAt.getFullYear()}-${String(item.order.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key])
      monthlyMap[key].cogs += Number(item.costPrice ?? 0) * item.quantity
  })

  expenses.forEach((e) => {
    const key = `${e.expenseDate.getFullYear()}-${String(e.expenseDate.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key]) monthlyMap[key].expense += Number(e.amount)
  })

  const financialTrend = Object.values(monthlyMap).map((item) => ({
    ...item,
    netProfit: item.revenue - item.cogs - item.expense,
  }))

  const dayOfWeekMap: Record<number, DayOfWeekAnalysis> = {
    0: { dayName: 'อาทิตย์', dayIndex: 0, orderCount: 0, totalSales: 0 },
    1: { dayName: 'จันทร์', dayIndex: 1, orderCount: 0, totalSales: 0 },
    2: { dayName: 'อังคาร', dayIndex: 2, orderCount: 0, totalSales: 0 },
    3: { dayName: 'พุธ', dayIndex: 3, orderCount: 0, totalSales: 0 },
    4: { dayName: 'พฤหัสบดี', dayIndex: 4, orderCount: 0, totalSales: 0 },
    5: { dayName: 'ศุกร์', dayIndex: 5, orderCount: 0, totalSales: 0 },
    6: { dayName: 'เสาร์', dayIndex: 6, orderCount: 0, totalSales: 0 },
  }

  const hourlyCount: Record<number, number> = {}
  const heatmapMap: Record<string, HeatmapCell> = {}

  orders.forEach((o) => {
    const day = o.createdAt.getDay()
    const hour = o.createdAt.getHours()
    const amount = Number(o.totalAmount)

    dayOfWeekMap[day].orderCount += 1
    dayOfWeekMap[day].totalSales += amount

    hourlyCount[hour] = (hourlyCount[hour] || 0) + 1

    const key = `${day}-${hour}`
    if (!heatmapMap[key]) {
      heatmapMap[key] = { dayOfWeek: day, hour, count: 0, sales: 0 }
    }
    heatmapMap[key].count += 1
    heatmapMap[key].sales += amount
  })

  const topBuyingHours = Object.entries(hourlyCount)
    .map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00 - ${String(hour).padStart(2, '0')}:59`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const productMap: Record<string, TopProductItem> = {}
  const variantMap: Record<string, TopVariantItem> = {}

  orderItems.forEach((item) => {
    const pName = item.title
    const vName = item.variantTitle
      ? `${item.title} (${item.variantTitle})`
      : item.title
    const qty = item.quantity
    const sales = Number(item.price) * qty

    if (!productMap[pName]) {
      productMap[pName] = { name: pName, quantity: 0, totalSales: 0 }
    }
    productMap[pName].quantity += qty
    productMap[pName].totalSales += sales

    if (!variantMap[vName]) {
      variantMap[vName] = { name: vName, quantity: 0, totalSales: 0 }
    }
    variantMap[vName].quantity += qty
    variantMap[vName].totalSales += sales
  })

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  const topVariants = Object.values(variantMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return {
    financialTrend,
    dayOfWeekTrend: Object.values(dayOfWeekMap),
    heatmap: Object.values(heatmapMap),
    topBuyingHours,
    topProducts,
    topVariants,
  }
}
