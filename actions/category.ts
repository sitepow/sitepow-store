'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { PaginatedResponse, PaginationParams } from '@/types/pagination'
import { getPathR2FromUrl } from '@/utils/image'
import {
  createPaginationMeta,
  getEmptyPaginatedResponse,
  sanitizePagination,
} from '@/utils/pagination'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { resolveStoreFilter } from '@/lib/store'

import { invalidateStorefrontCategoryCache } from './query-keys/storefront/invalidation/category'
import { r2DeleteImage } from './r2'

const categorySelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  image: true,
  translations: true,
} satisfies Prisma.CategorySelect

export type GetCategoriesItem = Prisma.CategoryGetPayload<{
  select: typeof categorySelect
}>

export type GetCategoriesResponse = PaginatedResponse<GetCategoriesItem>

interface GetCategoriesParams extends PaginationParams {}

export interface CreateCategoryInput {
  title: string
  slug: string
  storeId: string
  description?: string | null
  image?: string | null
  translations?: any
}

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, 'storeId'>>

const categoryDropdownSelect = {
  id: true,
  title: true,
} satisfies Prisma.CategorySelect

export type GetCategoryOptionsItem = Prisma.CategoryGetPayload<{
  select: typeof categoryDropdownSelect
}>

export async function getCategory(id: string) {
  try {
    if (!id) {
      return null
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { ...categorySelect, storeId: true },
    })

    if (!category) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: category.storeId,
      permission: 'canViewCategory',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    const { storeId: _, ...categoryData } = category
    return categoryData
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getCategories({
  page = 1,
  limit = 10,
  search,
  storeId,
}: GetCategoriesParams = {}): Promise<GetCategoriesResponse> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return getEmptyPaginatedResponse(page, limit)
  }

  try {
    const storeAccess = await resolveStoreFilter({
      userId,
      storeId,
      permission: 'canViewCategory',
    })

    if (!storeAccess.isAuthorized) {
      return getEmptyPaginatedResponse(page, limit)
    }

    const {
      page: sanitizedPage,
      limit: sanitizedLimit,
      skip,
    } = sanitizePagination(page, limit, { defaultLimit: 10, maxLimit: 20 })

    const whereClause: Prisma.CategoryWhereInput = {
      ...storeAccess.storeFilter,
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    }

    const [totalItems, categories] = await Promise.all([
      prisma.category.count({ where: whereClause }),
      prisma.category.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        select: categorySelect,
      }),
    ])

    return {
      data: categories,
      meta: createPaginationMeta(totalItems, sanitizedPage, sanitizedLimit),
    }
  } catch {
    return getEmptyPaginatedResponse(page, limit)
  }
}

export async function getCategoryOptions(filters?: {
  storeId?: string
  search?: string
}): Promise<GetCategoryOptionsItem[]> {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return []
    }

    const storeAccess = await resolveStoreFilter({
      userId,
      storeId: filters?.storeId,
      permission: 'canViewCategory',
    })

    if (!storeAccess.isAuthorized) {
      return []
    }

    const whereClause: Prisma.CategoryWhereInput = {
      ...storeAccess.storeFilter,
      ...(filters?.search
        ? { title: { contains: filters.search, mode: 'insensitive' } }
        : {}),
    }

    return await prisma.category.findMany({
      where: whereClause,
      select: categoryDropdownSelect,
      orderBy: { title: 'asc' },
    })
  } catch {
    return []
  }
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateCategory',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    const existing = await prisma.category.findUnique({
      where: { storeId_slug: { storeId: input.storeId, slug: input.slug } },
    })

    if (existing) {
      return {
        success: false,
        messageTH: 'Slug นี้ถูกใช้งานไปแล้วในร้านค้านี้',
        messageEN: 'This slug is already in use in this store',
      }
    }

    const category = await prisma.category.create({ data: input })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Category',
      entityId: category.id,
      details: { title: input.title, slug: input.slug, type: 'created' },
    })

    return {
      success: true,
      messageTH: 'สร้างหมวดหมู่สำเร็จแล้ว',
      messageEN: 'Category created successfully',
      data: category,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  try {
    if (!id) {
      return {
        success: false,
        messageTH: 'ไม่พบ Category ID',
        messageEN: 'Category ID not found',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
      }
    }

    const targetCategory = await prisma.category.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!targetCategory) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลหมวดหมู่',
        messageEN: 'Category data not found',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: targetCategory.storeId,
      permission: 'canUpdateCategory',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: input,
      select: {
        store: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: category.store.id,
      entity: 'Category',
      entityId: id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    if (category) {
      await invalidateStorefrontCategoryCache(category.store.slug)
    }

    return {
      success: true,
      messageTH: 'อัพเดตหมวดหมู่สำเร็จแล้ว',
      messageEN: 'Category updated successfully',
      data: category,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteCategory(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        messageTH: 'ไม่พบ Category ID',
        messageEN: 'Category ID not found',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
      }
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        storeId: true,
        store: { select: { slug: true } },
        title: true,
        image: true,
      },
    })

    if (!category) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลหมวดหมู่',
        messageEN: 'Category data not found',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: category.storeId,
      permission: 'canDeleteCategory',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    if (category.image) {
      const oldKey = getPathR2FromUrl(category.image)
      await r2DeleteImage(oldKey)
    }

    await prisma.category.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: category?.storeId,
      entity: 'Category',
      entityId: id,
      details: { title: category?.title, type: 'deleted' },
    })

    if (category) {
      await invalidateStorefrontCategoryCache(category.store.slug)
    }

    return {
      success: true,
      messageTH: 'ลบหมวดหมู่สำเร็จแล้ว',
      messageEN: 'Category deleted successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
