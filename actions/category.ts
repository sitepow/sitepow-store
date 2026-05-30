'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

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
