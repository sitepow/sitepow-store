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

    return {
      success: true,
      data: serializeDecimal(products) as POSProductItem[],
    }
  } catch (error) {
    console.error('getPOSProducts Error:', error)
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการโหลดสินค้า',
      data: [],
    }
  }
}
