'use server'

import { invalidateStorefrontProductCache } from '@/actions/query-keys/storefront/invalidation/product'
import { PLAN_DETAILS } from '@/constants/plan'
import {
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import {
  ActorType,
  DiscountType,
  LogAction,
  Prisma,
  ProductType,
} from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import {
  AffiliatePlatform,
  AffiliateProductLink,
} from '@/types/affiliate-product'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { getPathR2FromUrl } from '@/utils/image'
import { formatSlug } from '@/utils/slug'
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
  description?: string
  images?: { url: string; isPrimary: boolean }[]
  isPublished?: boolean
  variants: {
    id?: string
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
  affiliateLinks?: AffiliateProductLink[]
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
    if (storeId && storeId !== ALL_STORES && storeId !== '') {
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
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const quotaCheck = await checkCanCreateProduct(input.storeId)

    if (!quotaCheck.canCreate) {
      return {
        success: false,
        messageTH: quotaCheck.messageTH || quotaCheck.message,
        messageEN: quotaCheck.messageEN || quotaCheck.message,
        message: quotaCheck.message,
      }
    }

    const {
      variants,
      addons,
      metadata,
      tags,
      images,
      description,
      affiliateLinks,
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

    const detailsObj: Record<string, any> = metadata?.length
      ? Object.fromEntries(metadata.map(({ key, value }) => [key, value]))
      : {}

    if (description && description.trim()) {
      detailsObj.description = description.trim()
    }

    if (affiliateLinks && affiliateLinks.length > 0) {
      detailsObj.affiliateLinks = affiliateLinks
    }

    const details = Object.keys(detailsObj).length > 0 ? detailsObj : undefined

    // Resolve fallback branch if any stock is missing branchId
    let defaultBranchId: string | null = null
    const needsFallbackBranch = variants.some(
      (v) =>
        !v.stocks ||
        v.stocks.length === 0 ||
        v.stocks.some((s) => !s.branchId || s.branchId.trim() === ''),
    )
    if (needsFallbackBranch) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { storeId: input.storeId, isMain: true },
        select: { id: true },
      })
      if (defaultBranch) {
        defaultBranchId = defaultBranch.id
      } else {
        const anyBranch = await prisma.branch.findFirst({
          where: { storeId: input.storeId },
          select: { id: true },
        })
        if (anyBranch) {
          defaultBranchId = anyBranch.id
        } else {
          const newBranch = await prisma.branch.create({
            data: {
              storeId: input.storeId,
              name: 'สำนักงานใหญ่ (Main Branch)',
              isMain: true,
            },
            select: { id: true },
          })
          defaultBranchId = newBranch.id
        }
      }
    }

    const [product] = await prisma.$transaction([
      prisma.product.create({
        data: {
          ...rest,
          storeId,
          categoryId,
          isPublished,
          details: details as unknown as Prisma.InputJsonValue,
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
                create: (v.stocks && v.stocks.length > 0
                  ? v.stocks
                  : [
                      {
                        branchId: defaultBranchId || '',
                        quantity: 0,
                        minStock: 0,
                      },
                    ]
                )
                  .map((s) => ({
                    branchId: s.branchId || defaultBranchId || '',
                    quantity: s.quantity ?? 0,
                    minStock: s.minStock ?? 0,
                  }))
                  .filter((s) => Boolean(s.branchId)),
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

    return {
      success: true,
      messageTH: 'สร้างสินค้าสำเร็จแล้ว',
      messageEN: 'Product created successfully',
      message: 'สร้างสินค้าสำเร็จแล้ว',
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          messageTH: 'สินค้านี้มี slug ซ้ำกับสินค้าอื่นในระบบแล้ว',
          messageEN: 'A product with this slug already exists',
          message: 'สินค้านี้มี slug ซ้ำกับสินค้าอื่นในระบบแล้ว',
        }
      }
      if (error.code === 'P2003') {
        return {
          success: false,
          messageTH: 'ไม่พบข้อมูลที่เชื่อมโยง เช่น หมวดหมู่หรือสาขาที่ระบุ',
          messageEN: 'Linked data not found (e.g. category or branch)',
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
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        storeId: true,
        store: { select: { slug: true } },
        images: { select: { url: true } },
        variants: { select: { id: true, title: true, image: true } },
      },
    })

    if (!product) {
      return {
        success: false,
        messageTH: 'ไม่พบสินค้า',
        messageEN: 'Product not found',
        message: 'ไม่พบสินค้า',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: product.storeId,
      permission: 'canDeleteProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const productVariantIds = product.variants.map((v) => v.id)

    if (productVariantIds.length > 0) {
      const activeResellerStocks = await prisma.resellerStock.findMany({
        where: {
          variantId: { in: productVariantIds },
          allocatedQuantity: { gt: 0 },
        },
        include: {
          variant: { select: { title: true } },
        },
      })

      if (activeResellerStocks.length > 0) {
        const blockedVariantTitles = Array.from(
          new Set(activeResellerStocks.map((s) => s.variant.title)),
        ).join(', ')

        return {
          success: false,
          messageTH: `ไม่สามารถลบสินค้านี้ได้ เนื่องจากตัวเลือก (${blockedVariantTitles}) ยังมีสต็อกฝากขายค้างอยู่ที่ตัวแทน กรุณาดึงสต็อกคืนเข้าสาขาก่อนทำรายการลบ`,
          messageEN: `Cannot delete this product because variants (${blockedVariantTitles}) still have consignment stock with resellers. Please return stock to branch first`,
          message: `ไม่สามารถลบสินค้านี้ได้ เนื่องจากตัวเลือก (${blockedVariantTitles}) ยังมีสต็อกฝากขายค้างอยู่ที่ตัวแทน กรุณาดึงสต็อกคืนเข้าสาขาก่อนทำรายการลบ`,
        }
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

    return {
      success: true,
      messageTH: 'ลบสินค้าสำเร็จ',
      messageEN: 'Product deleted successfully',
      message: 'ลบสินค้าสำเร็จ',
    }
  } catch (error: unknown) {
    console.error(error)
    const errMessage =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบสินค้า'
    return {
      success: false,
      messageTH: errMessage,
      messageEN:
        error instanceof Error
          ? error.message
          : 'An error occurred while deleting product',
      message: errMessage,
    }
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
    return {
      success: false,
      messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      messageEN: 'Please sign in to proceed',
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    }
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        storeId: true,
        details: true,
        images: { select: { url: true } },
        variants: { select: { id: true, title: true, image: true } },
      },
    })

    if (!existingProduct) {
      return {
        success: false,
        messageTH: 'ไม่พบสินค้า',
        messageEN: 'Product not found',
        message: 'ไม่พบสินค้า',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingProduct.storeId,
      permission: 'canUpdateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const {
      variants,
      addons,
      metadata,
      tags,
      images,
      description,
      affiliateLinks,
      categoryId,
      isPublished,
      ...rest
    } = input

    const inputVariantIds = variants
      .map((v: any) => v.id)
      .filter((vid): vid is string => Boolean(vid))

    const existingVariantIds = existingProduct.variants.map((v) => v.id)

    const variantIdsToDelete = existingVariantIds.filter(
      (vid) => !inputVariantIds.includes(vid),
    )

    if (variantIdsToDelete.length > 0) {
      const activeResellerStocks = await prisma.resellerStock.findMany({
        where: {
          variantId: { in: variantIdsToDelete },
          allocatedQuantity: { gt: 0 },
        },
        include: {
          variant: { select: { title: true } },
        },
      })

      if (activeResellerStocks.length > 0) {
        const blockedVariantTitles = Array.from(
          new Set(activeResellerStocks.map((s) => s.variant.title)),
        ).join(', ')

        return {
          success: false,
          messageTH: `ไม่สามารถลบตัวเลือกสินค้า (${blockedVariantTitles}) ได้ เนื่องจากยังมีสต็อกฝากขายค้างอยู่ที่ตัวแทน กรุณาดึงสต็อกคืนเข้าสาขาก่อนทำรายการลบ`,
          messageEN: `Cannot delete variants (${blockedVariantTitles}) because they still have consignment stock with resellers. Please return stock to branch first`,
          message: `ไม่สามารถลบตัวเลือกสินค้า (${blockedVariantTitles}) ได้ เนื่องจากยังมีสต็อกฝากขายค้างอยู่ที่ตัวแทน กรุณาดึงสต็อกคืนเข้าสาขาก่อนทำรายการลบ`,
        }
      }
    }

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

    const existingDetails =
      (existingProduct.details as Record<string, any>) || {}
    const metadataObj = metadata?.length
      ? Object.fromEntries(metadata.map(({ key, value }) => [key, value]))
      : {}

    const detailsObj: Record<string, any> = {
      ...existingDetails,
      ...metadataObj,
    }

    if (description !== undefined) {
      if (description.trim()) {
        detailsObj.description = description.trim()
      } else {
        delete detailsObj.description
      }
    }

    if (affiliateLinks !== undefined) {
      detailsObj.affiliateLinks = affiliateLinks
    }

    const details = Object.keys(detailsObj).length > 0 ? detailsObj : undefined

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...rest,
          categoryId,
          isPublished,
          details: details as unknown as Prisma.InputJsonValue,
        },
      })

      await tx.productAddon.deleteMany({ where: { productId: id } })
      await tx.productTag.deleteMany({ where: { productId: id } })
      await tx.productImage.deleteMany({ where: { productId: id } })

      if (tagsArray.length > 0) {
        await tx.productTag.createMany({
          data: tagsArray.map((name) => ({ productId: id, name })),
        })
      }

      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img) => ({
            productId: id,
            url: img.url,
            isPrimary: img.isPrimary,
          })),
        })
      }

      if (addons && addons.length > 0) {
        await tx.productAddon.createMany({
          data: addons.map((a) => ({
            productId: id,
            title: a.title,
            price: a.price,
            isAvailable: a.isAvailable,
          })),
        })
      }

      if (variantIdsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: variantIdsToDelete } },
        })
      }

      for (const v of variants) {
        const variantId = (v as any).id

        const variantData = {
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
        }

        let currentVariantId = variantId

        if (variantId && existingVariantIds.includes(variantId)) {
          await tx.productVariant.update({
            where: { id: variantId },
            data: variantData,
          })
        } else {
          const newVariant = await tx.productVariant.create({
            data: {
              ...variantData,
              productId: id,
            },
          })
          currentVariantId = newVariant.id
        }

        if (v.digitalItems && v.digitalItems.length > 0) {
          await tx.digitalItem.deleteMany({
            where: { variantId: currentVariantId },
          })
          await tx.digitalItem.createMany({
            data: v.digitalItems.map((item) => ({
              variantId: currentVariantId,
              content: item.content,
              isUsed: item.isUsed,
            })),
          })
        }

        for (const s of v.stocks) {
          await tx.productStock.upsert({
            where: {
              branchId_variantId: {
                branchId: s.branchId,
                variantId: currentVariantId,
              },
            },
            update: {
              quantity: s.quantity,
              minStock: s.minStock,
            },
            create: {
              branchId: s.branchId,
              variantId: currentVariantId,
              quantity: s.quantity,
              minStock: s.minStock,
            },
          })
        }
      }

      const store = await tx.store.findUnique({
        where: { id: existingProduct.storeId },
        select: { slug: true },
      })

      if (store) {
        await Promise.all([
          invalidateStorefrontProductCache(store.slug),
          invalidateStorefrontCategoryCache(store.slug),
        ])
      }
    })

    return {
      success: true,
      messageTH: 'อัปเดตสินค้าสำเร็จ',
      messageEN: 'Product updated successfully',
      message: 'อัปเดตสินค้าสำเร็จ',
    }
  } catch (error: unknown) {
    console.error(error)
    const errMessage =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตสินค้า'
    return {
      success: false,
      messageTH: errMessage,
      messageEN:
        error instanceof Error
          ? error.message
          : 'An error occurred while updating product',
      message: errMessage,
    }
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
    return {
      success: false,
      messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      messageEN: 'Please sign in to proceed',
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    }
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
      return {
        success: false,
        messageTH: 'ไม่พบสินค้า',
        messageEN: 'Product not found',
        message: 'ไม่พบสินค้า',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: product.storeId,
      permission: 'canUpdateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
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
      messageTH: isPublished
        ? 'แสดงสินค้าที่หน้าร้านแล้ว'
        : 'ซ่อนสินค้าจากหน้าร้านแล้ว',
      messageEN: isPublished
        ? 'Product is now visible on storefront'
        : 'Product is now hidden from storefront',
      message: isPublished
        ? 'แสดงสินค้าที่หน้าร้านแล้ว'
        : 'ซ่อนสินค้าจากหน้าร้านแล้ว',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export interface BulkImportProductItem {
  title: string
  productType: ProductType
  variantTitle?: string
  sku: string
  price: number
  costPrice?: number
  categorySlug?: string
  initialStock?: number
  weight?: number
  digitalUrl?: string
  digitalItemContent?: string
  pointsAmount?: number
  discountType?: 'PERCENTAGE' | 'FIXED'
  discountAmount?: number
}

export interface BulkImportProductsInput {
  storeId: string
  branchId?: string
  products: BulkImportProductItem[]
}

export async function bulkImportProducts(input: BulkImportProductsInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    if (!input.storeId || input.storeId === ALL_STORES) {
      return {
        success: false,
        messageTH: 'กรุณาเลือกร้านค้าก่อนทำรายการ',
        messageEN: 'Please select a store to proceed',
        message: 'กรุณาเลือกร้านค้าก่อนทำรายการ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (!input.products || input.products.length === 0) {
      return {
        success: false,
        messageTH: 'ไม่มีรายการสินค้าที่พร้อมนำเข้า',
        messageEN: 'No valid products to import',
        message: 'ไม่มีรายการสินค้าที่พร้อมนำเข้า',
      }
    }

    // 1. Group items by product title to support multiple variants per product
    const productGroups = new Map<string, BulkImportProductItem[]>()
    for (const item of input.products) {
      const trimmedTitle = item.title?.trim()
      if (!trimmedTitle) continue
      const existing = productGroups.get(trimmedTitle) || []
      existing.push(item)
      productGroups.set(trimmedTitle, existing)
    }

    const newProductCount = productGroups.size
    if (newProductCount === 0) {
      return {
        success: false,
        messageTH: 'ไม่มีรายการสินค้าที่ถูกต้องสำหรับการนำเข้า',
        messageEN: 'No valid products found for import',
        message: 'ไม่มีรายการสินค้าที่ถูกต้องสำหรับการนำเข้า',
      }
    }

    // 2. Check store existence & subscription quota
    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      select: { id: true, slug: true, plan: true, productCount: true },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลร้านค้า',
        messageEN: 'Store not found',
        message: 'ไม่พบข้อมูลร้านค้า',
      }
    }

    const maxProducts = PLAN_DETAILS[store.plan]?.maxProducts ?? null
    if (
      maxProducts !== null &&
      store.productCount + newProductCount > maxProducts
    ) {
      const remainingQuota = Math.max(0, maxProducts - store.productCount)
      return {
        success: false,
        messageTH: `โควตาสินค้าไม่เพียงพอ (คงเหลือ ${remainingQuota} รายการ แต่ต้องการนำเข้า ${newProductCount} สินค้า)`,
        messageEN: `Insufficient product quota (${remainingQuota} remaining, attempting to import ${newProductCount} products)`,
        message: `โควตาสินค้าไม่เพียงพอ (คงเหลือ ${remainingQuota} รายการ)`,
      }
    }

    // 3. Resolve target branch
    let targetBranchId = input.branchId
    if (targetBranchId) {
      const validBranch = await prisma.branch.findFirst({
        where: { id: targetBranchId, storeId: input.storeId },
        select: { id: true },
      })
      if (!validBranch) targetBranchId = undefined
    }

    if (!targetBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { storeId: input.storeId },
        orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
        select: { id: true },
      })
      if (defaultBranch) {
        targetBranchId = defaultBranch.id
      } else {
        const newBranch = await prisma.branch.create({
          data: {
            storeId: input.storeId,
            name: 'สำนักงานใหญ่ (Main Branch)',
            isMain: true,
          },
          select: { id: true },
        })
        targetBranchId = newBranch.id
      }
    }

    // 4. Resolve categories
    const existingCategories = await prisma.category.findMany({
      where: { storeId: input.storeId },
      select: { id: true, slug: true, title: true },
    })

    let defaultCategoryId = existingCategories[0]?.id
    if (!defaultCategoryId) {
      const newCat = await prisma.category.create({
        data: {
          storeId: input.storeId,
          title: 'ทั่วไป',
          slug: 'general',
        },
        select: { id: true },
      })
      defaultCategoryId = newCat.id
    }

    const categoryBySlug = new Map<string, string>()
    for (const cat of existingCategories) {
      categoryBySlug.set(cat.slug.toLowerCase(), cat.id)
      categoryBySlug.set(cat.title.toLowerCase(), cat.id)
      categoryBySlug.set(cat.id, cat.id)
    }

    // 5. Check duplicate SKUs against database
    const allSkus = input.products
      .map((p) => p.sku?.trim())
      .filter((s): s is string => Boolean(s))

    if (allSkus.length > 0) {
      const existingVariantsWithSku = await prisma.productVariant.findMany({
        where: {
          product: { storeId: input.storeId },
          sku: { in: allSkus },
        },
        select: { sku: true },
      })

      if (existingVariantsWithSku.length > 0) {
        const dupSkus = existingVariantsWithSku
          .map((v) => v.sku)
          .slice(0, 5)
          .join(', ')
        return {
          success: false,
          messageTH: `พบ SKU ที่ซ้ำกับสินค้าที่มีอยู่ในระบบแล้ว (${dupSkus})`,
          messageEN: `Duplicate SKUs found in existing store database (${dupSkus})`,
          message: `พบ SKU ที่ซ้ำกับสินค้าที่มีอยู่ในระบบแล้ว (${dupSkus})`,
        }
      }
    }

    // 6. Create products and variants inside transaction
    let importedVariantsCount = 0

    await prisma.$transaction(
      async (tx) => {
        for (const [title, items] of productGroups) {
          const firstItem = items[0]
          const catId =
            (firstItem.categorySlug &&
              categoryBySlug.get(
                firstItem.categorySlug.toLowerCase().trim(),
              )) ||
            defaultCategoryId

          let baseSlug = formatSlug(title)
          if (!baseSlug) {
            baseSlug = `product-${Math.random().toString(36).substring(2, 8)}`
          }

          let finalSlug = baseSlug
          const slugExists = await tx.product.findUnique({
            where: {
              storeId_slug: { storeId: input.storeId, slug: finalSlug },
            },
            select: { id: true },
          })
          if (slugExists) {
            finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
          }

          const isAffiliate = firstItem.productType === 'AFFILIATE_LINK'
          const affiliateLinks: AffiliateProductLink[] | undefined = isAffiliate
            ? items.map((item, idx) => {
                let platform: AffiliatePlatform = 'OTHER'
                const url = (item.digitalUrl || '').toLowerCase()
                if (url.includes('shopee.')) platform = 'SHOPEE'
                else if (url.includes('lazada.')) platform = 'LAZADA'
                else if (url.includes('tiktok.')) platform = 'TIKTOK'

                const originalPrice =
                  item.discountAmount && item.discountAmount > 0
                    ? item.discountType === 'PERCENTAGE'
                      ? Math.round(
                          (item.price / (1 - item.discountAmount / 100)) * 100,
                        ) / 100
                      : item.price + item.discountAmount
                    : undefined

                return {
                  id: `aff-${Date.now()}-${idx}`,
                  platform,
                  url: item.digitalUrl?.trim() || '',
                  label: item.variantTitle?.trim() || '',
                  price: item.price,
                  originalPrice,
                  isDiscounted: Boolean(
                    originalPrice && originalPrice > item.price,
                  ),
                  discountText: item.discountAmount
                    ? `${item.discountAmount}${item.discountType === 'PERCENTAGE' ? '%' : '฿'} OFF`
                    : undefined,
                }
              })
            : undefined

          const product = await tx.product.create({
            data: {
              title,
              slug: finalSlug,
              productType: firstItem.productType,
              storeId: input.storeId,
              categoryId: catId,
              isPublished: true,
              details: affiliateLinks
                ? ({ affiliateLinks } as unknown as Prisma.InputJsonValue)
                : undefined,
              variants: {
                create: items.map((v) => {
                  const hasDiscount = Boolean(
                    v.discountType && v.discountAmount && v.discountAmount > 0,
                  )
                  return {
                    title: v.variantTitle?.trim() || 'Standard',
                    price: v.price,
                    costPrice: v.costPrice ?? 0,
                    sku: v.sku.trim(),
                    weight: v.weight ?? null,
                    digitalUrl: v.digitalUrl?.trim() || null,
                    discountActive: hasDiscount,
                    discountType: hasDiscount
                      ? (v.discountType as DiscountType)
                      : null,
                    discountAmount: hasDiscount ? v.discountAmount : null,
                    pointsActive: Boolean(v.pointsAmount && v.pointsAmount > 0),
                    pointsAmount: v.pointsAmount ?? 0,
                    isAvailable: true,
                    digitalItems:
                      v.productType === 'DIGITAL_ITEM' && v.digitalItemContent
                        ? {
                            create: [
                              {
                                content: v.digitalItemContent.trim(),
                                isUsed: false,
                              },
                            ],
                          }
                        : undefined,
                    stocks: {
                      create: [
                        {
                          branchId: targetBranchId!,
                          quantity: v.initialStock ?? 0,
                          minStock: 0,
                        },
                      ],
                    },
                  }
                }),
              },
            },
            select: { id: true },
          })

          importedVariantsCount += items.length

          await createLog({
            action: LogAction.CREATE_PRODUCT,
            actorType: ActorType.MERCHANT,
            storeId: input.storeId,
            entity: 'Product',
            entityId: product.id,
            details: { title, slug: finalSlug, variantsCount: items.length },
          })
        }

        // Increment store productCount
        await tx.store.update({
          where: { id: input.storeId },
          data: { productCount: { increment: newProductCount } },
        })
      },
      { timeout: 30000 },
    )

    // Invalidate storefront caches
    if (store.slug) {
      await Promise.all([
        invalidateStorefrontProductCache(store.slug),
        invalidateStorefrontCategoryCache(store.slug),
      ])
    }

    return {
      success: true,
      data: {
        productCount: newProductCount,
        variantsCount: importedVariantsCount,
      },
      messageTH: `นำเข้าสินค้าสำเร็จแล้ว ${importedVariantsCount} รายการ (${newProductCount} สินค้า)`,
      messageEN: `Successfully imported ${importedVariantsCount} items (${newProductCount} products)`,
      message: `นำเข้าสินค้าสำเร็จแล้ว ${importedVariantsCount} รายการ (${newProductCount} สินค้า)`,
    }
  } catch (error) {
    console.error('bulkImportProducts error:', error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}
