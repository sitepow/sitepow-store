'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { buildExpenseDateWithServerTime } from '@/utils/date'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { getPathR2FromUrl } from '@/utils/image'
import { CreateExpenseInput, UpdateExpenseInput } from '@/zod/expense'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { r2DeleteImage } from './r2'

export interface GetExpensesParams {
  storeId: string
  branchId?: string
  page?: number
  limit?: number
  search?: string
  category?: string
  startDate?: string | Date
  endDate?: string | Date
}

const expenseSelect = {
  id: true,
  storeId: true,
  branchId: true,
  title: true,
  amount: true,
  category: true,
  receiptImage: true,
  expenseDate: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ExpenseSelect

export type GetExpenseItem = Prisma.ExpenseGetPayload<{
  select: typeof expenseSelect
}>

export interface GetExpensesResponse {
  data: DecimalToNumber<GetExpenseItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getExpenses({
  storeId,
  branchId,
  page = 1,
  limit = 10,
  search,
  category,
  startDate,
  endDate,
}: GetExpensesParams): Promise<GetExpensesResponse> {
  const emptyResponse: GetExpensesResponse = {
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

  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return emptyResponse
  }

  try {
    const whereClause: Prisma.ExpenseWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewExpenses',
      })

      if (!authCheck.isAuthorized) {
        return emptyResponse
      }

      whereClause.storeId = storeId
    } else {
      const userStores = await prisma.store.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { employeeStores: { some: { employee: { userId } } } },
          ],
        },
        select: { id: true },
      })

      const storeIds = userStores.map((s) => s.id)
      whereClause.storeId = { in: storeIds }
    }

    if (branchId) {
      whereClause.branchId = branchId
    }

    if (category) {
      whereClause.category = category as Prisma.EnumExpenseCategoryFilter
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (startDate || endDate) {
      whereClause.expenseDate = {}
      if (startDate) whereClause.expenseDate.gte = new Date(startDate)
      if (endDate) whereClause.expenseDate.lte = new Date(endDate)
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const [totalItems, expenses] = await Promise.all([
      prisma.expense.count({ where: whereClause }),
      prisma.expense.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
        select: expenseSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(expenses),
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch (error) {
    console.error(error)
    return emptyResponse
  }
}

export async function createExpense(input: CreateExpenseInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateExpenses',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const expense = await prisma.expense.create({
      data: {
        storeId: input.storeId,
        branchId: input.branchId || null,
        title: input.title,
        amount: input.amount,
        category: input.category,
        receiptImage: input.receiptImage || null,
        expenseDate: buildExpenseDateWithServerTime(input.expenseDate),
        note: input.note || null,
      },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Expense',
      entityId: expense.id,
      details: {
        action: LogAction.CREATE_EXPENSE,
        title: expense.title,
        amount: expense.amount,
      },
    })

    return {
      success: true,
      message: 'บันทึกค่าใช้จ่ายสำเร็จ',
      data: serializeDecimal(expense),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateExpense(input: UpdateExpenseInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canUpdateExpenses',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id: input.id },
      select: { receiptImage: true },
    })

    if (!existingExpense) {
      return {
        success: false,
        message: 'ไม่พบรายการค่าใช้จ่ายที่ต้องการอัปเดต',
      }
    }

    if (
      input.receiptImage !== undefined &&
      existingExpense.receiptImage &&
      existingExpense.receiptImage !== input.receiptImage
    ) {
      const oldKey = getPathR2FromUrl(existingExpense.receiptImage)
      await r2DeleteImage(oldKey)
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: input.id },
      data: {
        ...(input.branchId !== undefined && { branchId: input.branchId }),
        ...(input.title && { title: input.title }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.category && { category: input.category }),
        ...(input.receiptImage !== undefined && {
          receiptImage: input.receiptImage || null,
        }),
        ...(input.expenseDate && {
          expenseDate: buildExpenseDateWithServerTime(input.expenseDate),
        }),
        ...(input.note !== undefined && { note: input.note }),
      },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Expense',
      entityId: updatedExpense.id,
      details: {
        action: LogAction.UPDATE_EXPENSE,
        title: updatedExpense.title,
      },
    })

    return {
      success: true,
      message: 'อัปเดตค่าใช้จ่ายสำเร็จ',
      data: serializeDecimal(updatedExpense),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteExpense(expenseId: string, storeId: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canDeleteExpenses',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: {
        receiptImage: true,
        title: true,
      },
    })

    if (!expense) {
      return { success: false, message: 'ไม่พบรายการค่าใช้จ่าย' }
    }

    if (expense.receiptImage) {
      const oldKey = getPathR2FromUrl(expense.receiptImage)
      await r2DeleteImage(oldKey)
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Expense',
      entityId: expenseId,
      details: {
        action: LogAction.DELETE_EXPENSE,
        title: expense.title,
      },
    })

    return { success: true, message: 'ลบรายการค่าใช้จ่ายสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
