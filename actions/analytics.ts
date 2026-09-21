'use server'

import { OrderStatus } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'
import { THAILAND_TZ, getThaiDateParts } from '@/utils/date'

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

export interface CustomerRetentionStats {
  totalUniqueCustomers: number
  newCustomersCount: number
  returningCustomersCount: number
  repeatPurchaseRate: number
}

export interface ProductPairingItem {
  pair: string
  count: number
}

export interface PaymentBreakdownItem {
  method: string
  count: number
  percentage: number
}

export interface AnalyticsResult {
  financialTrend: FinancialTrendItem[]
  dayOfWeekTrend: DayOfWeekAnalysis[]
  heatmap: HeatmapCell[]
  topBuyingHours: { hour: string; count: number }[]
  topProducts: TopProductItem[]
  topVariants: TopVariantItem[]
  customerRetention: CustomerRetentionStats
  topProductPairs: ProductPairingItem[]
  paymentBreakdown: PaymentBreakdownItem[]
}

export async function getAnalyticsOverview(
  storeId: string,
  branchId?: string,
  startDate?: string,
  endDate?: string,
): Promise<AnalyticsResult> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  const emptyResult: AnalyticsResult = {
    financialTrend: [],
    dayOfWeekTrend: [],
    heatmap: [],
    topBuyingHours: [],
    topProducts: [],
    topVariants: [],
    customerRetention: {
      totalUniqueCustomers: 0,
      newCustomersCount: 0,
      returningCustomersCount: 0,
      repeatPurchaseRate: 0,
    },
    topProductPairs: [],
    paymentBreakdown: [],
  }

  if (!userId || !storeId || storeId === ALL_STORES) {
    return emptyResult
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
    return emptyResult
  }

  const storeFilter = { storeId }
  const orderBranchFilter = validBranchId
    ? { items: { some: { branchId: validBranchId } } }
    : {}
  const orderItemBranchFilter = validBranchId ? { branchId: validBranchId } : {}
  const expenseBranchFilter = validBranchId
    ? { OR: [{ branchId: validBranchId }, { branchId: null }] }
    : {}

  let startRange: Date
  let endRange: Date

  if (startDate) {
    startRange = new Date(startDate)
    startRange.setHours(0, 0, 0, 0)
  } else {
    const now = new Date()
    startRange = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  }

  if (endDate) {
    endRange = new Date(endDate)
    endRange.setHours(23, 59, 59, 999)
  } else {
    endRange = new Date()
    endRange.setHours(23, 59, 59, 999)
  }

  const dateRangeFilter = {
    gte: startRange,
    lte: endRange,
  }

  const [orders, orderItems, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...storeFilter,
        createdAt: dateRangeFilter,
        status: { not: OrderStatus.CANCELLED },
        ...orderBranchFilter,
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        customerId: true,
        customer: {
          select: {
            phone: true,
          },
        },
        paymentMethod: true,
      },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          ...storeFilter,
          createdAt: dateRangeFilter,
          status: { not: OrderStatus.CANCELLED },
        },
        ...orderItemBranchFilter,
      },
      select: {
        id: true,
        orderId: true,
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
        expenseDate: dateRangeFilter,
        ...expenseBranchFilter,
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    }),
  ])

  const diffInDays = Math.ceil(
    (endRange.getTime() - startRange.getTime()) / (1000 * 60 * 60 * 24),
  )
  const isDailyMode = diffInDays <= 31

  const periodMap: Record<
    string,
    { key: string; label: string; item: FinancialTrendItem }
  > = {}

  const getPeriodInfo = (date: Date) => {
    const { year, month, day } = getThaiDateParts(date)

    if (isDailyMode) {
      const key = `${year}-${month}-${day}`
      const label = new Intl.DateTimeFormat('th-TH', {
        timeZone: THAILAND_TZ,
        day: 'numeric',
        month: 'short',
      }).format(date)
      return { key, label }
    } else {
      const key = `${year}-${month}`
      const label = new Intl.DateTimeFormat('th-TH', {
        timeZone: THAILAND_TZ,
        month: 'short',
        year: '2-digit',
      }).format(date)
      return { key, label }
    }
  }

  const cursor = new Date(startRange)
  while (cursor <= endRange) {
    const { key, label } = getPeriodInfo(cursor)
    if (!periodMap[key]) {
      periodMap[key] = {
        key,
        label,
        item: {
          period: label,
          revenue: 0,
          cogs: 0,
          expense: 0,
          netProfit: 0,
        },
      }
    }

    if (isDailyMode) {
      cursor.setDate(cursor.getDate() + 1)
    } else {
      cursor.setMonth(cursor.getMonth() + 1)
    }
  }

  orders.forEach((o) => {
    const { key } = getPeriodInfo(o.createdAt)
    if (periodMap[key]) {
      periodMap[key].item.revenue += Number(o.totalAmount)
    }
  })

  orderItems.forEach((item) => {
    const { key } = getPeriodInfo(item.order.createdAt)
    if (periodMap[key]) {
      periodMap[key].item.cogs += Number(item.costPrice ?? 0) * item.quantity
    }
  })

  expenses.forEach((e) => {
    const { key } = getPeriodInfo(e.expenseDate)
    if (periodMap[key]) {
      periodMap[key].item.expense += Number(e.amount)
    }
  })

  const financialTrend = Object.values(periodMap).map(({ item }) => ({
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
  const paymentMap: Record<string, number> = {}
  const customerOrderCountMap: Record<string, number> = {}

  orders.forEach((o) => {
    const { dayOfWeek: day, hour } = getThaiDateParts(o.createdAt)
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

    const method = o.paymentMethod || 'ไม่ระบุ'
    paymentMap[method] = (paymentMap[method] || 0) + 1

    const customerIdentifier = o.customerId || o.customer?.phone
    if (customerIdentifier) {
      customerOrderCountMap[customerIdentifier] =
        (customerOrderCountMap[customerIdentifier] || 0) + 1
    }
  })

  const topBuyingHours = Object.entries(hourlyCount)
    .map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00 - ${String(hour).padStart(2, '0')}:59`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const customerCounts = Object.values(customerOrderCountMap)
  const totalUniqueCustomers = customerCounts.length
  const returningCustomersCount = customerCounts.filter((c) => c > 1).length
  const newCustomersCount = totalUniqueCustomers - returningCustomersCount
  const repeatPurchaseRate =
    totalUniqueCustomers > 0
      ? Number(
          ((returningCustomersCount / totalUniqueCustomers) * 100).toFixed(1),
        )
      : 0

  const customerRetention: CustomerRetentionStats = {
    totalUniqueCustomers,
    newCustomersCount,
    returningCustomersCount,
    repeatPurchaseRate,
  }

  const totalOrdersCount = orders.length
  const paymentBreakdown: PaymentBreakdownItem[] = Object.entries(paymentMap)
    .map(([method, count]) => ({
      method,
      count,
      percentage:
        totalOrdersCount > 0
          ? Number(((count / totalOrdersCount) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const productMap: Record<string, TopProductItem> = {}
  const variantMap: Record<string, TopVariantItem> = {}
  const orderProductsMap: Record<string, Set<string>> = {}

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

    if (!orderProductsMap[item.orderId]) {
      orderProductsMap[item.orderId] = new Set()
    }
    orderProductsMap[item.orderId].add(pName)
  })

  const pairMap: Record<string, number> = {}
  Object.values(orderProductsMap).forEach((productSet) => {
    const productsList = Array.from(productSet).sort()
    if (productsList.length < 2) return

    for (let i = 0; i < productsList.length; i++) {
      for (let j = i + 1; j < productsList.length; j++) {
        const pairKey = `${productsList[i]} + ${productsList[j]}`
        pairMap[pairKey] = (pairMap[pairKey] || 0) + 1
      }
    }
  })

  const topProductPairs: ProductPairingItem[] = Object.entries(pairMap)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

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
    customerRetention,
    topProductPairs,
    paymentBreakdown,
  }
}
