'use server'

import { Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const posProductSelect = {
  id: true,
  title: true,
  productType: true,
  categoryId: true,
  images: {
    where: { isPrimary: true },
    select: { url: true },
    take: 1,
  },
  variants: {
    where: { isAvailable: true },
    select: {
      id: true,
      title: true,
      price: true,
      sku: true,
      discountActive: true,
      discountType: true,
      discountAmount: true,
      stocks: {
        select: {
          branchId: true,
          quantity: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect

export type POSProductItem = DecimalToNumber<
  Prisma.ProductGetPayload<{ select: typeof posProductSelect }>
>

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
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ', data: [] }
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
      select: posProductSelect,
      orderBy: { title: 'asc' },
    })

    const formatted = products.map((p) => ({
      ...p,
      variants: p.variants.map((v) => ({
        ...v,
        stock: v.stocks.find((s) => s.branchId === branchId)?.quantity ?? 0,
      })),
    }))

    return {
      success: true,
      data: serializeDecimal(formatted),
    }
  } catch (error) {
    console.error(error)
    return { success: false, data: [] }
  }
}
