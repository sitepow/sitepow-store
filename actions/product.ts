'use server'

import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

export interface CreateProductInput {
  storeId: string
  categoryId: string
  title: string
  slug: string
  tags?: string
  images?: string[]
  weight?: number
  width?: number
  height?: number
  length?: number
  variants: {
    title: string
    price: number
    sku?: string
    stocks: { branchId: string; quantity: number; minStock: number }[]
    discount: { active: boolean; type: 'PERCENTAGE' | 'FIXED'; amount: number }
    rewardPoints: { isActive: boolean; amount: number }
  }[]
  addons?: { title: string; price: number; isAvailable: boolean }[]
  metadata?: { key: string; value: string }[]
}

const productSelect = {
  id: true,
  title: true,
  slug: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      title: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
    },
  },
  images: {
    where: { isPrimary: true },
    select: {
      url: true,
    },
    take: 1,
  },
  variants: {
    select: {
      id: true,
      title: true,
      price: true,
      sku: true,
    },
  },
} satisfies Prisma.ProductSelect

export type GetProductsItem = Prisma.ProductGetPayload<{
  select: typeof productSelect
}>

export interface GetProductsParams {
  storeId?: string
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}

export interface GetProductsResponse {
  data: DecimalToNumber<GetProductsItem>[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getProducts({
  storeId,
  page = 1,
  limit = 10,
  search,
  categoryId,
}: GetProductsParams): Promise<GetProductsResponse> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
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

  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ProductWhereInput = {}

    if (storeId && storeId !== 'all' && storeId !== '') {
      whereClause.storeId = storeId
      whereClause.store = { ownerId: userId }
    } else {
      whereClause.store = { ownerId: userId }
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const [totalItems, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: productSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(products),
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
        limit: limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}

export async function createProduct(input: CreateProductInput) {
  try {
    const {
      variants,
      addons,
      metadata,
      tags,
      images,
      storeId,
      categoryId,
      ...rest
    } = input

    const tagsArray = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const details = metadata?.length
      ? Object.fromEntries(metadata.map(({ key, value }) => [key, value]))
      : undefined

    await prisma.product.create({
      data: {
        ...rest,
        storeId,
        categoryId,
        details,
        tags: {
          create: tagsArray.map((name) => ({ name })),
        },
        images: {
          create: images?.map((url, i) => ({ url, isPrimary: i === 0 })) ?? [],
        },
        variants: {
          create: variants.map((v) => ({
            title: v.title,
            price: v.price,
            sku: v.sku ?? '',
            discountActive: v.discount.active,
            discountType: v.discount.active ? v.discount.type : null,
            discountAmount: v.discount.active ? v.discount.amount : null,
            pointsActive: v.rewardPoints.isActive,
            pointsAmount: v.rewardPoints.amount,
            stocks: {
              create: v.stocks.map((s) => ({
                branchId: s.branchId,
                quantity: s.quantity,
                minStock: s.minStock,
              })),
            },
          })),
        },
        addons: {
          create:
            addons?.map((a) => ({
              title: a.title,
              price: a.price,
              isAvailable: a.isAvailable,
            })) ?? [],
        },
      },
      select: productSelect,
    })

    return { success: true, message: 'สร้างสินค้าสำเร็จแล้ว' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          message: 'สินค้านี้มี slug ซ้ำกับสินค้าอื่นในระบบแล้ว',
        }
      }
      if (error.code === 'P2003') {
        return {
          success: false,
          message: 'ไม่พบข้อมูลที่เชื่อมโยง เช่น หมวดหมู่หรือสาขาที่ระบุ',
        }
      }
    }
    console.error(error)
    return { success: false }
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const product = await prisma.product.findFirst({
      where: { id, store: { ownerId: userId } },
      select: { id: true },
    })

    if (!product) {
      return { success: false, message: 'ไม่พบสินค้า หรือคุณไม่มีสิทธิ์ลบ' }
    }

    await prisma.product.delete({ where: { id } })

    return { success: true, message: 'ลบสินค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
