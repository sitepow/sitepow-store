'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

const categorySelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  image: true,
} satisfies Prisma.CategorySelect

export type GetCategoriesItem = Prisma.CategoryGetPayload<{
  select: typeof categorySelect
}>

export interface GetCategoriesResponse {
  data: GetCategoriesItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface GetCategoriesParams {
  page?: number
  limit?: number
  search?: string
  storeId?: string
}

export interface CreateCategoryInput {
  title: string
  slug: string
  storeId: string
  description?: string | null
  image?: string | null
}

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, 'storeId'>>

const categoryDropdownSelect = {
  id: true,
  title: true,
} satisfies Prisma.CategorySelect

export type GetCategoryOptionsItem = Prisma.CategoryGetPayload<{
  select: typeof categoryDropdownSelect
}>

export async function getCategories({
  page = 1,
  limit = 10,
  search,
  storeId,
}: GetCategoriesParams = {}): Promise<GetCategoriesResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.CategoryWhereInput = {}

    if (storeId) {
      whereClause.storeId = storeId
    }

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' }
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

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: categories,
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
    return {
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
  }
}

export async function getCategoryOptions(filters?: {
  storeId?: string
  search?: string
}): Promise<GetCategoryOptionsItem[]> {
  try {
    const whereClause: Prisma.CategoryWhereInput = {}

    if (filters?.storeId) {
      whereClause.storeId = filters.storeId
    }

    if (filters?.search) {
      whereClause.title = { contains: filters.search, mode: 'insensitive' }
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
  const existing = await prisma.category.findUnique({
    where: { storeId_slug: { storeId: input.storeId, slug: input.slug } },
    select: { id: true },
  })

  if (existing) {
    throw new Error('Slug นี้ถูกใช้งานไปแล้วในร้านค้านี้')
  }

  return await prisma.category.create({ data: input })
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  if (!id) {
    throw new Error('ไม่พบ Category ID')
  }

  return await prisma.category.update({ where: { id }, data: input })
}

export async function deleteCategory(id: string) {
  if (!id) {
    throw new Error('ไม่พบ Category ID')
  }

  await prisma.category.delete({ where: { id } })

  return { message: 'ลบหมวดหมู่สำเร็จ' }
}
