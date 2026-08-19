'use server'

import { invalidateStorefrontProductCache } from '@/actions/query-keys/storefront/invalidation/product'
import { PLAN_DETAILS } from '@/constants/plan'
import {
  ActorType,
  LogAction,
  Prisma,
  ProductType,
} from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { getPathR2FromUrl } from '@/utils/image'
import { checkCanCreateProduct } from '@/utils/subscription'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { invalidateStorefrontCategoryCache } from './query-keys/storefront/invalidation/category'
import { r2DeleteImage } from './r2'

export interface CreateProductInput {
  storeId: string
  categoryId: string
  title: string
  slug: string
  tags?: string
  images?: { url: string; isPrimary: boolean }[]
  isPublished?: boolean
  variants: {
    title: string
    price: number
    costPrice: number
    sku?: string
    image?: string | null
    digitalUrl: string
    weight?: number
    width?: number
    height?: number
    length?: number
    digitalItems?: {
      content: string
      isUsed: boolean
    }[]
    stocks: { branchId: string; quantity: number; minStock: number }[]
    discount: { active: boolean; type: 'PERCENTAGE' | 'FIXED'; amount: number }
    rewardPoints: { isActive: boolean; amount: number }
    isAvailable: boolean
  }[]
  addons?: { title: string; price: number; isAvailable: boolean }[]
  metadata?: { key: string; value: string }[]
  productType: ProductType
}

const productSelect = {
  id: true,
  title: true,
  slug: true,
  isPublished: true,
  createdAt: true,
  productType: true,
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
      costPrice: true,
      sku: true,
      digitalUrl: true,
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
  const userSession = await getCurrentUser()
  const userId = userSession?.id

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
    if (storeId && storeId !== 'all' && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewProducts',
      })

      if (!authCheck.isAuthorized) {
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

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ProductWhereInput = {}

    if (storeId && storeId !== 'all' && storeId !== '') {
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const { canCreate, message } = await checkCanCreateProduct(input.storeId)

    if (!canCreate) {
      return { success: false, message }
    }

    const {
      variants,
      addons,
      metadata,
      tags,
      images,
      storeId,
      categoryId,
      isPublished = true,
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

    const [product] = await prisma.$transaction([
      prisma.product.create({
        data: {
          ...rest,
          storeId,
          categoryId,
          isPublished,
          details,
          tags: {
            create: tagsArray.map((name) => ({ name })),
          },
          images: {
            create:
              images?.map((img) => ({
                url: img.url,
                isPrimary: img.isPrimary,
              })) ?? [],
          },
          variants: {
            create: variants.map((v) => ({
              title: v.title,
              price: v.price,
              costPrice: v.costPrice,
              sku: v.sku ?? '',
              image: v.image ?? null,
              digitalUrl: v.digitalUrl ?? '',
              discountActive: v.discount.active,
              discountType: v.discount.active ? v.discount.type : null,
              discountAmount: v.discount.active ? v.discount.amount : null,
              pointsActive: v.rewardPoints.isActive,
              pointsAmount: v.rewardPoints.amount,
              digitalItems: {
                create:
                  v.digitalItems?.map((item) => ({
                    content: item.content,
                    isUsed: item.isUsed,
                  })) ?? [],
              },
              stocks: {
                create: v.stocks.map((s) => ({
                  branchId: s.branchId,
                  quantity: s.quantity,
                  minStock: s.minStock,
                })),
              },
              isAvailable: v.isAvailable ?? false,
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
      }),
      prisma.store.update({
        where: { id: storeId },
        data: { productCount: { increment: 1 } },
      }),
    ])

    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      select: { slug: true },
    })

    if (store) {
      await Promise.all([
        invalidateStorefrontProductCache(store.slug),
        invalidateStorefrontCategoryCache(store.slug),
      ])
    }

    await createLog({
      action: LogAction.CREATE_PRODUCT,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Product',
      entityId: product.id,
      details: { title: rest.title, slug: rest.slug, categoryId },
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        storeId: true,
        store: { select: { slug: true } },
        images: { select: { url: true } },
        variants: { select: { image: true } },
      },
    })

    if (!product) {
      return { success: false, message: 'ไม่พบสินค้า' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: product.storeId,
      permission: 'canDeleteProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const allUrls = [
      ...product.images.map((img) => img.url),
      ...product.variants
        .map((v) => v.image)
        .filter((img): img is string => Boolean(img)),
    ]

    if (allUrls.length > 0) {
      await Promise.all(
        allUrls.map(async (url) => {
          const key = getPathR2FromUrl(url)
          if (key) {
            await r2DeleteImage(key)
          }
        }),
      )
    }

    await prisma.$transaction([
      prisma.product.delete({ where: { id } }),
      prisma.store.update({
        where: { id: product.storeId },
        data: { productCount: { decrement: 1 } },
      }),
    ])

    await Promise.all([
      invalidateStorefrontProductCache(product.store.slug),
      invalidateStorefrontCategoryCache(product.store.slug),
    ])

    await createLog({
      action: LogAction.DELETE_PRODUCT,
      actorType: ActorType.MERCHANT,
      storeId: product.storeId,
      entity: 'Product',
      entityId: id,
      details: { title: product.title },
    })

    return { success: true, message: 'ลบสินค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getProductById(id: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return null
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: { select: { id: true } },
        images: true,
        tags: true,
        variants: {
          include: {
            stocks: true,
            digitalItems: true,
          },
        },
        addons: true,
      },
    })

    if (!product) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: product.storeId,
      permission: 'canViewProducts',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return serializeDecimal(product)
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateProduct(id: string, input: CreateProductInput) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        storeId: true,
        images: { select: { url: true } },
        variants: { select: { image: true } },
      },
    })

    if (!existingProduct) {
      return { success: false, message: 'ไม่พบสินค้า' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingProduct.storeId,
      permission: 'canUpdateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const {
      variants,
      addons,
      metadata,
      tags,
      images,
      categoryId,
      isPublished,
      ...rest
    } = input

    const oldImageUrls = new Set<string>()
    existingProduct.images.forEach((img) => {
      if (img.url) oldImageUrls.add(img.url)
    })
    existingProduct.variants.forEach((v) => {
      if (v.image) oldImageUrls.add(v.image)
    })

    const newImageUrls = new Set<string>()
    images?.forEach((img) => {
      if (img.url) newImageUrls.add(img.url)
    })
    variants?.forEach((v) => {
      if (v.image) newImageUrls.add(v.image)
    })

    const urlsToDelete = Array.from(oldImageUrls).filter(
      (url) => !newImageUrls.has(url),
    )

    if (urlsToDelete.length > 0) {
      await Promise.all(
        urlsToDelete.map(async (url) => {
          const key = getPathR2FromUrl(url)
          if (key) {
            await r2DeleteImage(key)
          }
        }),
      )
    }

    const tagsArray = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []
    const details = metadata?.length
      ? Object.fromEntries(metadata.map(({ key, value }) => [key, value]))
      : undefined

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...rest,
          categoryId,
          isPublished,
          details,
        },
      })

      await tx.productVariant.deleteMany({ where: { productId: id } })
      await tx.productAddon.deleteMany({ where: { productId: id } })
      await tx.productTag.deleteMany({ where: { productId: id } })
      await tx.productImage.deleteMany({ where: { productId: id } })

      const product = await tx.product.update({
        where: { id },
        data: {
          tags: { create: tagsArray.map((name) => ({ name })) },
          images: {
            create:
              images?.map((img) => ({
                url: img.url,
                isPrimary: img.isPrimary,
              })) ?? [],
          },
          variants: {
            create: variants.map((v) => ({
              title: v.title,
              price: v.price,
              costPrice: v.costPrice,
              sku: v.sku ?? '',
              image: v.image ?? null,
              digitalUrl: v.digitalUrl ?? '',
              discountActive: v.discount.active,
              discountType: v.discount.active ? v.discount.type : null,
              discountAmount: v.discount.active ? v.discount.amount : null,
              pointsActive: v.rewardPoints.isActive,
              pointsAmount: v.rewardPoints.amount,
              isAvailable: v.isAvailable,
              digitalItems: {
                create:
                  v.digitalItems?.map((item) => ({
                    content: item.content,
                    isUsed: item.isUsed,
                  })) ?? [],
              },
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
        select: {
          store: { select: { slug: true } },
        },
      })

      await Promise.all([
        invalidateStorefrontProductCache(product.store.slug),
        invalidateStorefrontCategoryCache(product.store.slug),
      ])
    })

    return { success: true, message: 'อัปเดตสินค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getProductOptions(storeId: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return []
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewProducts',
    })

    if (!authCheck.isAuthorized) {
      return []
    }

    return await prisma.product.findMany({
      where: {
        storeId,
      },
      select: {
        id: true,
        title: true,
        category: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getProductQuota(storeId: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return null
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewProducts',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        plan: true,
        productCount: true,
      },
    })

    if (!store) {
      return null
    }

    return {
      plan: store.plan,
      productCount: store.productCount,
      maxProducts: PLAN_DETAILS[store.plan].maxProducts,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function toggleProductVisibility(
  id: string,
  isPublished: boolean,
) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        storeId: true,
        store: { select: { slug: true } },
      },
    })

    if (!product) {
      return { success: false, message: 'ไม่พบสินค้า' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: product.storeId,
      permission: 'canUpdateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.product.update({
      where: { id },
      data: { isPublished },
    })

    await invalidateStorefrontProductCache(product.store.slug)

    return {
      success: true,
      message: isPublished
        ? 'แสดงสินค้าที่หน้าร้านแล้ว'
        : 'ซ่อนสินค้าจากหน้าร้านแล้ว',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
