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
    const ownProductsWhere: Prisma.ProductWhereInput = {
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

    const ownProductsPromise = prisma.product.findMany({
      where: ownProductsWhere,
      select: getPosProductSelect(branchId),
      orderBy: { title: 'asc' },
    })

    const resellerAgreementsPromise = prisma.resellerAgreement.findMany({
      where: {
        status: AgreementStatus.ACTIVE,
        resellerStoreId: storeId,
      },
      include: {
        customPrices: true,
        stocks: {
          include: {
            variant: true,
          },
        },
      },
    })

    const [ownProducts, resellerAgreements] = await Promise.all([
      ownProductsPromise,
      resellerAgreementsPromise,
    ])

    const resellerProductsList: POSProductItem[] = []

    for (const agreement of resellerAgreements) {
      const validStocks = agreement.stocks.filter(
        (s) => s.acceptedQuantity - s.soldQuantity > 0,
      )
      const allowedVariantIds = validStocks.map((s) => s.variantId)

      if (allowedVariantIds.length === 0) {
        continue
      }

      const resellerProductsWhere: Prisma.ProductWhereInput = {
        storeId: agreement.supplierStoreId,
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
      }

      const supplierProducts = await prisma.product.findMany({
        where: resellerProductsWhere,
        select: getPosProductSelect(branchId),
        orderBy: { title: 'asc' },
      })

      for (const product of supplierProducts) {
        const formattedVariants = product.variants
          .filter((variant) => allowedVariantIds.includes(variant.id))
          .map((variant) => {
            const stock = agreement.stocks.find(
              (s) => s.variantId === variant.id,
            )
            const availableQuantity = stock
              ? stock.acceptedQuantity - stock.soldQuantity
              : 0

            const customPrice = agreement.customPrices.find(
              (cp) => cp.variantId === variant.id,
            )

            const originalPriceNum = Number(variant.price)
            let calculatedDiscountAmountNum: number | null = null
            let calculatedDiscountType: DiscountType | null = null

            if (customPrice?.specialPrice) {
              const specialPriceNum = Number(customPrice.specialPrice)
              calculatedDiscountAmountNum = originalPriceNum - specialPriceNum
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
              calculatedDiscountAmountNum = Number(
                agreement.defaultDiscountAmount,
              )
              calculatedDiscountType = agreement.defaultDiscountType
            }

            const hasDiscount =
              calculatedDiscountAmountNum !== null &&
              calculatedDiscountAmountNum > 0

            return {
              ...variant,
              price: originalPriceNum,
              discountActive: hasDiscount,
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

        if (formattedVariants.length > 0) {
          const resellerProduct = {
            ...product,
            variants: formattedVariants,
            isReseller: true,
            resellerAgreementId: agreement.id,
          }

          resellerProductsList.push(
            resellerProduct as unknown as POSProductItem,
          )
        }
      }
    }

    const allProducts = [...ownProducts, ...resellerProductsList]

    return {
      success: true,
      data: serializeDecimal(allProducts) as POSProductItem[],
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      data: [],
    }
  }
}
