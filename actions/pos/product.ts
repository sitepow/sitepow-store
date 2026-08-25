'use server'

import {
  AgreementStatus,
  DiscountType,
  Prisma,
} from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

function getPosProductSelect(branchId: string) {
  return {
    id: true,
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

  const authCheck = await verifyEmployeePermission({
    userId,
    storeId,
    permission: 'canViewProducts',
  })

  if (!authCheck.isAuthorized) {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึงสินค้า', data: [] }
  }

  try {
    const resellerAgreement = await prisma.resellerAgreement.findFirst({
      where: {
        supplierStoreId: storeId,
        status: AgreementStatus.ACTIVE,
        OR: [
          { resellerCustomerId: userId },
          { resellerStore: { ownerId: userId } },
        ],
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

    if (resellerAgreement) {
      const validResellerStocks = resellerAgreement.stocks.filter(
        (s) => s.acceptedQuantity - s.soldQuantity > 0,
      )

      const allowedVariantIds = validResellerStocks.map((s) => s.variantId)

      if (allowedVariantIds.length === 0) {
        return { success: true, data: [] }
      }

      const whereClause: Prisma.ProductWhereInput = {
        storeId,
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
                    some: { sku: { contains: search, mode: 'insensitive' } },
                  },
                },
              ],
            }
          : {}),
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        select: getPosProductSelect(branchId),
        orderBy: { title: 'asc' },
      })

      const resellerProducts = products.map((product) => {
        const formattedVariants = product.variants
          .filter((variant) => allowedVariantIds.includes(variant.id))
          .map((variant) => {
            const resellerStock = resellerAgreement.stocks.find(
              (s) => s.variantId === variant.id,
            )
            const availableQuantity = resellerStock
              ? resellerStock.acceptedQuantity - resellerStock.soldQuantity
              : 0

            const customPrice = resellerAgreement.customPrices.find(
              (cp) => cp.variantId === variant.id,
            )
            let finalPrice = new Prisma.Decimal(variant.price)

            if (customPrice?.specialPrice) {
              finalPrice = customPrice.specialPrice
            } else if (customPrice?.discountType === DiscountType.FIXED) {
              finalPrice = finalPrice.sub(customPrice.discountAmount)
            } else if (customPrice?.discountType === DiscountType.PERCENTAGE) {
              const discount = finalPrice
                .mul(customPrice.discountAmount)
                .div(100)
              finalPrice = finalPrice.sub(discount)
            } else if (
              resellerAgreement.defaultDiscountType &&
              resellerAgreement.defaultDiscountAmount
            ) {
              if (
                resellerAgreement.defaultDiscountType ===
                DiscountType.PERCENTAGE
              ) {
                const discount = finalPrice
                  .mul(resellerAgreement.defaultDiscountAmount)
                  .div(100)
                finalPrice = finalPrice.sub(discount)
              } else if (
                resellerAgreement.defaultDiscountType === DiscountType.FIXED
              ) {
                finalPrice = finalPrice.sub(
                  resellerAgreement.defaultDiscountAmount,
                )
              }
            }

            if (finalPrice.lessThan(0)) finalPrice = new Prisma.Decimal(0)

            return {
              ...variant,
              price: finalPrice,
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

      return {
        success: true,
        data: serializeDecimal(resellerProducts) as POSProductItem[],
      }
    }

    const whereClause: Prisma.ProductWhereInput = {
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
      where: whereClause,
      select: getPosProductSelect(branchId),
      orderBy: { title: 'asc' },
    })

    return {
      success: true,
      data: serializeDecimal(products) as POSProductItem[],
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      data: [],
    }
  }
}
