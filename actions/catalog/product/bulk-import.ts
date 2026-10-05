'use server'

import { invalidateStorefrontCategoryCache } from '@/actions/storefront/category/invalidation'
import { PLAN_DETAILS } from '@/constants/billing/plan'
import {
  ActorType,
  LogAction,
  Prisma,
  ProductType,
} from '@/generated/prisma/client'
import { ParsedProduct } from '@/lib/csv/product-csv'
import { formatSlug } from '@/utils/formatting/slug'

import { createLog } from '@/lib/activity/log'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { getCurrentUser } from '@/lib/auth/server'
import { invalidateProduct } from '@/lib/cache'
import { prisma } from '@/lib/db/prisma'

export interface BulkImportResponse {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
}

/**
 * Generates a clean URL-friendly slug with guaranteed uniqueness within the store
 */
function generateUniqueSlug(
  baseText: string,
  existingSlugs: Set<string>,
): string {
  let clean = formatSlug(baseText)

  // If Thai or empty, ensure valid alphanumeric prefix
  if (!clean || clean.length < 2) {
    clean = `product-${Math.random().toString(36).substring(2, 8)}`
  }

  // Ensure minimum length
  if (clean.length < 3) {
    clean = `${clean}-item`
  }

  let uniqueSlug = clean
  let counter = 1

  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${clean}-${counter}`
    counter++
  }

  existingSlugs.add(uniqueSlug)
  return uniqueSlug
}

export async function bulkImportProducts(
  storeId: string,
  products: ParsedProduct[],
): Promise<BulkImportResponse> {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (!storeId || storeId === 'all') {
      return { success: false, message: 'กรุณาเลือกร้านค้าที่ต้องการนำเข้าสินค้า' }
    }

    if (!products || products.length === 0) {
      return { success: false, message: 'ไม่พบรายการสินค้าที่จะนำเข้า' }
    }

    // 1. Verify Permission
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canCreateProducts',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอในการสร้างสินค้า',
      }
    }

    // 2. Check Store & Quota Limit
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, plan: true, productCount: true, slug: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้าในระบบ' }
    }

    const maxProducts = PLAN_DETAILS[store.plan].maxProducts
    if (
      maxProducts !== null &&
      store.productCount + products.length > maxProducts
    ) {
      const remainingQuota = Math.max(0, maxProducts - store.productCount)
      return {
        success: false,
        message: `โควตาสินค้าไม่เพียงพอ (ร้านค้ามี ${store.productCount}/${maxProducts} สินค้า, สามารถเพิ่มได้อีกเพียง ${remainingQuota} รายการ แต่ต้องการนำเข้า ${products.length} รายการ)`,
      }
    }

    // 3. Resolve Categories
    const existingCategories = await prisma.category.findMany({
      where: { storeId },
      select: { id: true, title: true, slug: true },
    })

    const categoryMap = new Map<string, string>()
    const usedCategorySlugs = new Set<string>()

    for (const cat of existingCategories) {
      categoryMap.set(cat.title.trim().toLowerCase(), cat.id)
      usedCategorySlugs.add(cat.slug)
    }

    // 4. Resolve Branches for Physical Stocks
    const branches = await prisma.branch.findMany({
      where: { storeId },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, isMain: true },
    })

    const defaultBranchId = branches[0]?.id || ''
    const branchMap = new Map<string, string>()
    for (const b of branches) {
      branchMap.set(b.name.trim().toLowerCase(), b.id)
      if (b.isMain) {
        branchMap.set('main', b.id)
        branchMap.set('สาขาหลัก', b.id)
      }
    }

    // 5. Resolve Existing Product Slugs
    const existingProductSlugs = await prisma.product.findMany({
      where: { storeId },
      select: { slug: true },
    })

    const usedProductSlugs = new Set<string>(
      existingProductSlugs.map((p) => p.slug),
    )

    // 6. Pre-create any missing categories
    const neededCategories = new Set<string>()
    for (const p of products) {
      const catName = (p.category || 'ทั่วไป').trim()
      if (!categoryMap.has(catName.toLowerCase())) {
        neededCategories.add(catName)
      }
    }

    for (const catTitle of neededCategories) {
      const catSlug = generateUniqueSlug(catTitle, usedCategorySlugs)
      const newCat = await prisma.category.create({
        data: {
          storeId,
          title: catTitle,
          slug: catSlug,
        },
      })
      categoryMap.set(catTitle.toLowerCase(), newCat.id)
    }

    // 7. Execute Product Import in Batches
    let importedCount = 0
    const errors: string[] = []

    // Process products in chunks of 20 to avoid large single-transaction timeouts
    const CHUNK_SIZE = 20
    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE)

      await prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const categoryId =
            categoryMap.get(item.category.trim().toLowerCase()) ||
            existingCategories[0]?.id ||
            ''

          const productSlug = generateUniqueSlug(
            item.slug || item.title,
            usedProductSlugs,
          )

          const isPhysical = item.productType === ProductType.PHYSICAL
          const isDigitalLink = item.productType === ProductType.DIGITAL_LINK
          const isDigitalItem = item.productType === ProductType.DIGITAL_ITEM

          const createdProduct = await tx.product.create({
            data: {
              storeId,
              categoryId,
              title: item.title,
              slug: productSlug,
              productType: item.productType,
              isPublished: item.isPublished,
              details: item.description
                ? { description: item.description }
                : undefined,
              tags: {
                create: item.tags.map((name) => ({ name })),
              },
              images: {
                create: item.images.map((url, idx) => ({
                  url,
                  isPrimary: idx === 0,
                })),
              },
              variants: {
                create: item.variants.map((v) => {
                  const branchId =
                    (v.branchName &&
                      branchMap.get(v.branchName.toLowerCase())) ||
                    defaultBranchId

                  return {
                    title: v.title,
                    price: v.price,
                    costPrice: v.costPrice,
                    sku: v.sku || '',
                    digitalUrl: isDigitalLink ? v.digitalUrl || '' : null,
                    isAvailable: v.isAvailable,
                    weight: isPhysical ? v.weight : null,
                    width: isPhysical ? v.width : null,
                    height: isPhysical ? v.height : null,
                    length: isPhysical ? v.length : null,
                    // Physical Stock
                    stocks:
                      isPhysical && branchId
                        ? {
                            create: [
                              {
                                branchId,
                                quantity: v.stockQuantity,
                                minStock: 0,
                              },
                            ],
                          }
                        : undefined,
                    // Digital Items (Keys / Serial Codes)
                    digitalItems:
                      isDigitalItem && v.digitalKeys && v.digitalKeys.length > 0
                        ? {
                            create: v.digitalKeys.map((keyContent) => ({
                              content: keyContent,
                              isUsed: false,
                            })),
                          }
                        : undefined,
                  }
                }),
              },
            },
          })

          importedCount++
        }

        // Increment Store productCount
        await tx.store.update({
          where: { id: storeId },
          data: { productCount: { increment: chunk.length } },
        })
      })
    }

    // 8. Cache Invalidation & Logging
    await Promise.all([
      invalidateProduct(storeId),
      store.slug ? invalidateStorefrontCategoryCache(store.slug) : null,
    ])

    await createLog({
      action: LogAction.CREATE_PRODUCT,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Product',
      entityId: storeId,
      details: {
        summary: `นำเข้าสินค้าผ่าน CSV สำเร็จ ${importedCount} รายการ`,
        importedCount,
        firstProduct: products[0]?.title,
      },
    })

    return {
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `นำเข้าสินค้าสำเร็จเรียบร้อย ${importedCount} รายการ`,
    }
  } catch (error) {
    console.error('Error during bulk import products:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการนำเข้าสินค้า',
    }
  }
}
