'use server'

import {
  AgreementStatus,
  DiscountType,
  Prisma,
} from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

function getPosProductSelect(branchId: string) {
  return {
    id: true,
    storeId: true,
    title: true,
    productType: true,
    categoryId: true,
    images: {
      select: { url: true, isPrimary: true },
    },
    options: {
      select: {
        id: true,
        title: true,
        maxSelect: true,
        require: true,
        choices: {
          select: { id: true, name: true, extraPrice: true },
        },
      },
    },
    addons: {
      where: { isAvailable: true },
      select: { id: true, title: true, price: true, isAvailable: true },
    },
    variants: {
      where: { isAvailable: true },
      select: {
        id: true,
        sku: true,
        title: true,
        price: true,
        image: true,
        isAvailable: true,
        discountActive: true,
        discountType: true,
        discountAmount: true,
        pointsActive: true,
        pointsAmount: true,
        weight: true,
        width: true,
        height: true,
        length: true,
        stocks: {
          where: { branchId },
          select: {
            quantity: true,
            branchId: true,
            branch: { select: { name: true } },
          },
        },
        digitalItems: {
          select: {
            id: true,
            isUsed: true,
          },
        },
      },
    },
  } satisfies Prisma.ProductSelect
}

export type POSProductItem = DecimalToNumber<
  Prisma.ProductGetPayload<{ select: ReturnType<typeof getPosProductSelect> }>
> & {
  storeId: string
  isReseller?: boolean
  resellerAgreementId?: string
}

export async function getPOSProducts({
  storeId,
  branchId,
  search,
  categoryId,
}: {
  storeId: string
  branchId: string
  search?: string
  categoryId?: string
}) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ', data: [] }
  }

  if (!storeId || !branchId) {
    return { success: true, data: [] }
  }

  try {
    const targetStore = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        ownerId: true,
        employeeStores: {
          where: { employee: { userId } },
          select: { id: true },
        },
      },
    })

    const isDirectOwner = targetStore?.ownerId === userId
    const isDirectEmployee = (targetStore?.employeeStores?.length ?? 0) > 0

    if (!isDirectOwner && !isDirectEmployee) {
      return {
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงสินค้าร้านนี้',
        data: [],
      }
    }

    const whereCondition: Prisma.ProductWhereInput = {
      storeId,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              {
                variants: {
                  some: { sku: { contains: search, mode: 'insensitive' } },
                },
              },
            ],
          }
        : {}),
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: getPosProductSelect(branchId),
      orderBy: { title: 'asc' },
    })

    return {
      success: true,
      data: serializeDecimal(products) as POSProductItem[],
    }
  } catch (error) {
    console.error(error)
    return { success: false, data: [] }
  }
}

function getResellerProductSelect(
  branchId: string,
  allowedVariantIds: string[],
) {
  return {
    id: true,
    storeId: true,
    title: true,
    productType: true,
    categoryId: true,
    images: {
      select: { url: true, isPrimary: true },
    },
    options: {
      select: {
        id: true,
        title: true,
        maxSelect: true,
        require: true,
        choices: {
          select: { id: true, name: true, extraPrice: true },
        },
      },
    },
    addons: {
      where: { isAvailable: true },
      select: { id: true, title: true, price: true, isAvailable: true },
    },
    variants: {
      where: {
        isAvailable: true,
        id: { in: allowedVariantIds },
      },
      select: {
        id: true,
        sku: true,
        title: true,
        price: true,
        image: true,
        isAvailable: true,
        discountActive: true,
        discountType: true,
        discountAmount: true,
        pointsActive: true,
        pointsAmount: true,
        weight: true,
        width: true,
        height: true,
        length: true,
        digitalItems: {
          select: {
            id: true,
            isUsed: true,
          },
        },
      },
    },
  } satisfies Prisma.ProductSelect
}

export type ResellerPOSProductItem = DecimalToNumber<
  Prisma.ProductGetPayload<{
    select: ReturnType<typeof getResellerProductSelect>
  }>
> & {
  storeId: string
  isReseller: boolean
  resellerAgreementId: string
}

export async function getResellerPOSProducts({
  supplierStoreId,
  branchId,
  search,
  categoryId,
}: {
  supplierStoreId: string
  branchId: string
  search?: string
  categoryId?: string
}) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ', data: [] }
  }

  try {
    const resellerAgreement = await prisma.resellerAgreement.findFirst({
      where: {
        supplierStoreId,
        status: AgreementStatus.ACTIVE,
        OR: [
          { resellerCustomerId: userId },
          { resellerStore: { ownerId: userId } },
          {
            resellerStore: {
              employeeStores: {
                some: { employee: { userId } },
              },
            },
          },
        ],
      },
      include: {
        customPrices: true,
        stocks: {
          include: { variant: true },
        },
      },
    })

    if (!resellerAgreement) {
      return { success: true, data: [] }
    }

    const allowedVariantIds = resellerAgreement.stocks
      .filter((s) => s.acceptedQuantity - s.soldQuantity > 0)
      .map((s) => s.variantId)

    if (allowedVariantIds.length === 0) {
      return { success: true, data: [] }
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: supplierStoreId,
        variants: {
          some: {
            id: { in: allowedVariantIds },
            isAvailable: true,
          },
        },
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                {
                  variants: {
                    some: {
                      id: { in: allowedVariantIds },
                      sku: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: getResellerProductSelect(branchId, allowedVariantIds),
      orderBy: { title: 'asc' },
    })

    const resellerProducts = products
      .map((product) => {
        if (!product.variants || product.variants.length === 0) return null

        const formattedVariants = product.variants.map((variant) => {
          const resellerStock = resellerAgreement.stocks.find(
            (s) => s.variantId === variant.id,
          )
          const availableQuantity = resellerStock
            ? resellerStock.acceptedQuantity - resellerStock.soldQuantity
            : 0

          const customPrice = resellerAgreement.customPrices.find(
            (cp) => cp.variantId === variant.id,
          )

          const originalPriceNum = Number(variant.price)
          let calculatedDiscountAmountNum: number | null = null
          let calculatedDiscountType: DiscountType | null = null

          if (customPrice?.specialPrice) {
            calculatedDiscountAmountNum =
              originalPriceNum - Number(customPrice.specialPrice)
            calculatedDiscountType = DiscountType.FIXED
          } else if (
            customPrice?.discountType &&
            customPrice.discountAmount != null
          ) {
            calculatedDiscountAmountNum = Number(customPrice.discountAmount)
            calculatedDiscountType = customPrice.discountType
          } else if (
            resellerAgreement.defaultDiscountType &&
            resellerAgreement.defaultDiscountAmount
          ) {
            calculatedDiscountAmountNum = Number(
              resellerAgreement.defaultDiscountAmount,
            )
            calculatedDiscountType = resellerAgreement.defaultDiscountType
          }

          return {
            ...variant,
            price: originalPriceNum,
            discountActive: (calculatedDiscountAmountNum ?? 0) > 0,
            discountType: calculatedDiscountType,
            discountAmount: calculatedDiscountAmountNum,
            stocks: [
              {
                quantity: availableQuantity,
                branchId,
                branch: { name: 'สต็อกฝากขาย' },
              },
            ],
          }
        })

        return {
          ...product,
          variants: formattedVariants,
          isReseller: true,
          resellerAgreementId: resellerAgreement.id,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return {
      success: true,
      data: serializeDecimal(resellerProducts) as ResellerPOSProductItem[],
    }
  } catch (error) {
    console.error(error)
    return { success: false, data: [] }
  }
}
