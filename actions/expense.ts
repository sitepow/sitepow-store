'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PaginatedResponse, PaginationParams } from '@/types/pagination'
import { buildExpenseDateWithServerTime } from '@/utils/date'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { getPathR2FromUrl } from '@/utils/image'
import {
  createPaginationMeta,
  getEmptyPaginatedResponse,
  sanitizePagination,
} from '@/utils/pagination'
import { CreateExpenseInput, UpdateExpenseInput } from '@/zod/expense'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { resolveStoreFilter } from '@/lib/store'

import { r2DeleteImage } from './r2'

export interface GetExpensesParams extends PaginationParams {
  storeId?: string
  branchId?: string
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

export type GetExpensesResponse = PaginatedResponse<
  DecimalToNumber<GetExpenseItem>
>

export async function getExpenses({
  storeId,
  branchId,
  page = 1,
  limit = 10,
  search,
  category,
  startDate,
  endDate,
}: GetExpensesParams = {}): Promise<GetExpensesResponse> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return getEmptyPaginatedResponse(page, limit)
  }

  try {
    const storeAccess = await resolveStoreFilter({
      userId,
      storeId,
      permission: 'canViewExpenses',
    })

    if (!storeAccess.isAuthorized) {
      return getEmptyPaginatedResponse(page, limit)
    }

    const whereClause: Prisma.ExpenseWhereInput = {
      ...storeAccess.storeFilter,
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

    const {
      page: sanitizedPage,
      limit: sanitizedLimit,
      skip,
    } = sanitizePagination(page, limit, { defaultLimit: 10, maxLimit: 50 })

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

    return {
      data: serializeDecimal(expenses),
      meta: createPaginationMeta(totalItems, sanitizedPage, sanitizedLimit),
    }
  } catch (error) {
    console.error(error)
    return getEmptyPaginatedResponse(page, limit)
  }
}

export async function createExpense(input: CreateExpenseInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่มีสิทธิ์เข้าถึง',
        messageEN: 'Access denied',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateExpenses',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
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
      messageTH: 'บันทึกค่าใช้จ่ายสำเร็จ',
      messageEN: 'Expense recorded successfully',
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
      return {
        success: false,
        messageTH: 'ไม่มีสิทธิ์เข้าถึง',
        messageEN: 'Access denied',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canUpdateExpenses',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id: input.id },
      select: { receiptImage: true },
    })

    if (!existingExpense) {
      return {
        success: false,
        messageTH: 'ไม่พบรายการค่าใช้จ่ายที่ต้องการอัปเดต',
        messageEN: 'Expense item to update not found',
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
      messageTH: 'อัปเดตค่าใช้จ่ายสำเร็จ',
      messageEN: 'Expense updated successfully',
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
      return {
        success: false,
        messageTH: 'ไม่มีสิทธิ์เข้าถึง',
        messageEN: 'Access denied',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canDeleteExpenses',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: {
        receiptImage: true,
        title: true,
      },
    })

    if (!expense) {
      return {
        success: false,
        messageTH: 'ไม่พบรายการค่าใช้จ่าย',
        messageEN: 'Expense item not found',
      }
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

    return {
      success: true,
      messageTH: 'ลบรายการค่าใช้จ่ายสำเร็จ',
      messageEN: 'Expense deleted successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
