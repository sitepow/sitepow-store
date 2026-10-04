'use server'

import {
  AgreementStatus,
  DiscountType,
  Prisma,
} from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/shared/decimal'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

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

  if (!userId || !storeId || !branchId) {
    return { success: true, data: [] }
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        storeId: storeId,
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
      },
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
  agreementId,
  branchId,
}: {
  agreementId: string
  branchId: string
  search?: string
  categoryId?: string
}) {
  if (!agreementId || !branchId) {
    return { success: true, data: [] }
  }

  try {
    const agreement = await prisma.resellerAgreement.findUnique({
      where: {
        id: agreementId,
        status: AgreementStatus.ACTIVE,
      },
      include: {
        customPrices: true,
        stocks: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!agreement || !agreement.stocks.length) {
      return { success: true, data: [] }
    }

    const resellerProductsMap = new Map()

    agreement.stocks.forEach((stock) => {
      const availableQty = stock.acceptedQuantity - stock.soldQuantity
      if (availableQty <= 0) {
        return
      }

      const variant = stock.variant
      const product = variant.product

      const customPrice = agreement.customPrices.find(
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
        agreement.defaultDiscountType &&
        agreement.defaultDiscountAmount
      ) {
        calculatedDiscountAmountNum = Number(agreement.defaultDiscountAmount)
        calculatedDiscountType = agreement.defaultDiscountType
      }

      const formattedVariant = {
        ...variant,
        price: originalPriceNum,
        discountActive: (calculatedDiscountAmountNum ?? 0) > 0,
        discountType: calculatedDiscountType,
        discountAmount: calculatedDiscountAmountNum,
        stocks: [
          {
            quantity: availableQty,
            branchId,
            branch: { name: 'สต็อกฝากขาย' },
          },
        ],
      }

      if (!resellerProductsMap.has(product.id)) {
        resellerProductsMap.set(product.id, {
          ...product,
          variants: [formattedVariant],
          isReseller: true,
          resellerAgreementId: agreement.id,
        })
      } else {
        resellerProductsMap.get(product.id).variants.push(formattedVariant)
      }
    })

    const resellerProducts = Array.from(resellerProductsMap.values())

    return {
      success: true,
      data: serializeDecimal(resellerProducts) as ResellerPOSProductItem[],
    }
  } catch (error) {
    console.error(error)
    return { success: false, data: [] }
  }
}
