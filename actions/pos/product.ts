'use server'

import {
  AgreementStatus,
  DefaultRole,
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

  if (!userId || !storeId || !branchId) {
    return { success: true, data: [] }
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    if (store && store.ownerId !== userId) {
      const employeeStore = await prisma.employeeStore.findFirst({
        where: {
          storeId,
          employee: { userId },
        },
        include: {
          branches: {
            include: { role: true },
          },
        },
      })

      const isPosReseller = employeeStore?.branches.some(
        (b) => b.role?.name === DefaultRole.POS_RESELLER,
      )
      const hasOtherRole = employeeStore?.branches.some(
        (b) => b.role?.name && b.role.name !== DefaultRole.POS_RESELLER,
      )

      // External resellers have no store products of their own; they only sell consignment stock
      if (isPosReseller && !hasOtherRole) {
        return { success: true, data: [] }
      }
    }

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
  storeId,
  search,
  categoryId,
}: {
  agreementId?: string
  branchId: string
  storeId?: string
  search?: string
  categoryId?: string
}) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId || !branchId || (!agreementId && !storeId)) {
    return { success: true, data: [] }
  }

  try {
    const agreementsInclude = {
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
    }

    let agreements: any[] = []

    if (agreementId) {
      const single = await prisma.resellerAgreement.findUnique({
        where: {
          id: agreementId,
          status: AgreementStatus.ACTIVE,
        },
        include: agreementsInclude,
      })
      if (single) agreements.push(single)
    } else if (storeId) {
      agreements = await prisma.resellerAgreement.findMany({
        where: {
          status: AgreementStatus.ACTIVE,
          OR: [
            { resellerCustomerId: userId, supplierStoreId: storeId },
            { resellerStoreId: storeId },
          ],
        },
        include: agreementsInclude,
      })
    }

    if (!agreements.length) {
      return { success: true, data: [] }
    }

    const resellerProductsMap = new Map()

    for (const agreement of agreements) {
      agreement.stocks.forEach((stock: any) => {
        const availableQty = stock.acceptedQuantity - stock.soldQuantity
        if (availableQty <= 0) {
          return
        }

        const variant = stock.variant
        const product = variant.product

        if (categoryId && product.categoryId !== categoryId) {
          return
        }

        if (search) {
          const query = search.toLowerCase()
          const matchTitle = product.title?.toLowerCase().includes(query)
          const matchSku = variant.sku?.toLowerCase().includes(query)
          const matchVariant = variant.title?.toLowerCase().includes(query)
          if (!matchTitle && !matchSku && !matchVariant) {
            return
          }
        }

        const customPrice = agreement.customPrices.find(
          (cp: any) => cp.variantId === variant.id,
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
    }

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
