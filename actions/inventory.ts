'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

interface GetInventoryParams {
  storeId: string
  branchId?: string
  page?: number
  limit?: number
  search?: string
}

const inventorySelect = {
  id: true,
  quantity: true,
  minStock: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
      isMain: true,
      storeId: true,
    },
  },
  variant: {
    select: {
      id: true,
      title: true,
      sku: true,
      price: true,
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.ProductStockSelect

export type GetInventoryItem = Prisma.ProductStockGetPayload<{
  select: typeof inventorySelect
}>

export interface GetInventoryResponse {
  data: DecimalToNumber<GetInventoryItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface UpdateStockInput {
  minStock: number
}

export interface UpsertStockInput {
  variantId: string
  branchId: string
  quantity: number
  minStock?: number
}

export async function getInventory({
  storeId,
  branchId,
  page = 1,
  limit = 10,
  search,
}: GetInventoryParams): Promise<GetInventoryResponse> {
  const emptyResponse: GetInventoryResponse = {
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

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return emptyResponse
  }

  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ProductStockWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canManageStock',
      })

      if (!authCheck.isAuthorized) {
        return emptyResponse
      }

      whereClause.branch = { storeId }
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
      whereClause.branch = { storeId: { in: storeIds } }
    }

    if (branchId && branchId !== ALL_STORES) {
      whereClause.branchId = branchId
    }

    if (search) {
      whereClause.OR = [
        {
          variant: {
            product: { title: { contains: search, mode: 'insensitive' } },
          },
        },
        { variant: { title: { contains: search, mode: 'insensitive' } } },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [totalItems, stocks] = await Promise.all([
      prisma.productStock.count({ where: whereClause }),
      prisma.productStock.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: [{ branch: { isMain: 'desc' } }, { updatedAt: 'desc' }],
        select: inventorySelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(stocks),
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch {
    return emptyResponse
  }
}

export async function updateStock(id: string, input: UpdateStockInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Stock ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const stockItem = await prisma.productStock.findUnique({
      where: { id },
      select: { branch: { select: { storeId: true } } },
    })

    if (!stockItem) {
      return { success: false, message: 'ไม่พบข้อมูลสต็อก' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: stockItem.branch.storeId,
      permission: 'canManageStock',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updatedStock = await prisma.productStock.update({
      where: { id },
      data: input,
      select: {
        ...inventorySelect,
        branch: {
          select: { storeId: true, id: true, name: true, isMain: true },
        },
      },
    })

    await createLog({
      action: LogAction.UPDATE_STOCK,
      actorType: ActorType.MERCHANT,
      storeId: updatedStock.branch.storeId,
      entity: 'ProductStock',
      entityId: id,
      details: { minStock: input.minStock, type: 'updated' },
    })

    return {
      success: true,
      message: 'อัปเดตสต็อกสำเร็จ',
      data: serializeDecimal(updatedStock),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function upsertStock(input: UpsertStockInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const { variantId, branchId, quantity, minStock = 0 } = input

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { storeId: true },
    })

    if (!branch) {
      return { success: false, message: 'ไม่พบข้อมูลสาขา' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: branch.storeId,
      permission: 'canManageStock',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const stock = await prisma.productStock.upsert({
      where: { branchId_variantId: { branchId, variantId } },
      update: { quantity, minStock },
      create: { variantId, branchId, quantity, minStock },
      select: inventorySelect,
    })

    await createLog({
      action: LogAction.UPDATE_STOCK,
      actorType: ActorType.MERCHANT,
      storeId: branch.storeId,
      entity: 'ProductStock',
      entityId: stock.id,
      details: { variantId, branchId, quantity, minStock, type: 'upserted' },
    })

    return {
      success: true,
      message: 'บันทึกสต็อกสำเร็จ',
      data: serializeDecimal(stock),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
