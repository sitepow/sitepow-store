'use server'

import { Prisma } from '@/generated/prisma/client'
import { PurchaseOrderStatus } from '@/generated/prisma/enums'
import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { serializeDecimal } from '@/utils/shared/decimal'

export interface CreatePurchaseOrderItemInput {
  productId?: string | null
  variantId?: string | null
  title: string
  variantTitle?: string | null
  sku?: string | null
  image?: string | null
  quantity: number
  costPrice?: number | null
  unit?: string | null
}

export interface CreatePurchaseOrderInput {
  storeId: string
  title?: string | null
  supplier?: string | null
  buyerName?: string | null
  note?: string | null
  targetDate?: string | Date | null
  items: CreatePurchaseOrderItemInput[]
}

function generatePONumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `PO-${year}${month}${day}-${randomSuffix}`
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (!input.storeId) {
      return { success: false, message: 'กรุณาระบุร้านค้า' }
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, message: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' }
    }

    const orderNumber = generatePONumber()
    const totalEstimatedAmount = input.items.reduce(
      (sum, it) => sum + (Number(it.costPrice) || 0) * (it.quantity || 1),
      0,
    )

    const targetDate = input.targetDate ? new Date(input.targetDate) : null

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        storeId: input.storeId,
        title: input.title || 'ใบสั่งซื้อสินค้า / รายการซื้อของ',
        supplier: input.supplier || null,
        buyerName: input.buyerName || null,
        note: input.note || null,
        targetDate,
        totalEstimatedAmount: new Prisma.Decimal(totalEstimatedAmount),
        status: PurchaseOrderStatus.PENDING,
        items: {
          create: input.items.map((it) => ({
            productId: it.productId || null,
            variantId: it.variantId || null,
            title: it.title,
            variantTitle: it.variantTitle || null,
            sku: it.sku || null,
            image: it.image || null,
            quantity: Math.max(1, it.quantity || 1),
            costPrice: new Prisma.Decimal(Number(it.costPrice) || 0),
            unit: it.unit || 'ชิ้น',
            isPurchased: false,
            purchasedQty: 0,
          })),
        },
      },
      include: {
        items: true,
        store: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            logo: true,
            taxId: true,
            branches: {
              where: { isMain: true },
              take: 1,
              select: {
                address: true,
                district: true,
                subDistrict: true,
                province: true,
                postcode: true,
              },
            },
          },
        },
      },
    })

    return {
      success: true,
      message: 'สร้างใบสั่งซื้อสินค้าเรียบร้อยแล้ว',
      data: serializeDecimal(po),
    }
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ' }
  }
}

export async function getPurchaseOrder(id: string) {
  try {
    if (!id) return null

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        store: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            logo: true,
            taxId: true,
            branches: {
              where: { isMain: true },
              take: 1,
              select: {
                address: true,
                district: true,
                subDistrict: true,
                province: true,
                postcode: true,
              },
            },
          },
        },
      },
    })

    if (!po) return null
    return serializeDecimal(po)
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    return null
  }
}

export async function getPurchaseOrders(storeId: string) {
  try {
    if (!storeId) return []

    const list = await prisma.purchaseOrder.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        items: true,
      },
    })

    return serializeDecimal(list)
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return []
  }
}

export interface UpdatePurchaseItemInput {
  itemId: string
  isPurchased: boolean
  purchasedQty?: number
  actualCostPrice?: number
  note?: string
}

export async function updatePurchaseOrderItem(input: UpdatePurchaseItemInput) {
  try {
    if (!input.itemId) {
      return { success: false, message: 'ไม่พบรหัสรายการ' }
    }

    const item = await prisma.purchaseOrderItem.findUnique({
      where: { id: input.itemId },
      select: { purchaseOrderId: true, quantity: true, costPrice: true },
    })

    if (!item) {
      return { success: false, message: 'ไม่พบรายการสินค้า' }
    }

    const updateData: {
      isPurchased: boolean
      purchasedQty?: number
      actualCostPrice?: Prisma.Decimal
      note?: string | null
    } = {
      isPurchased: input.isPurchased,
    }

    if (input.purchasedQty !== undefined) {
      updateData.purchasedQty = input.purchasedQty
    } else if (input.isPurchased) {
      updateData.purchasedQty = item.quantity
    } else {
      updateData.purchasedQty = 0
    }

    if (input.actualCostPrice !== undefined) {
      updateData.actualCostPrice = new Prisma.Decimal(input.actualCostPrice)
    }

    if (input.note !== undefined) {
      updateData.note = input.note
    }

    await prisma.purchaseOrderItem.update({
      where: { id: input.itemId },
      data: updateData,
    })

    // Recalculate parent PO actual total and status
    const allItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: item.purchaseOrderId },
      select: {
        isPurchased: true,
        purchasedQty: true,
        actualCostPrice: true,
        costPrice: true,
      },
    })

    const totalItems = allItems.length
    const purchasedItemsCount = allItems.filter((i) => i.isPurchased).length

    let nextStatus: PurchaseOrderStatus = PurchaseOrderStatus.PENDING
    if (purchasedItemsCount === totalItems && totalItems > 0) {
      nextStatus = PurchaseOrderStatus.COMPLETED
    } else if (purchasedItemsCount > 0) {
      nextStatus = PurchaseOrderStatus.PARTIAL
    }

    const totalActual = allItems.reduce((sum, it) => {
      if (!it.isPurchased) return sum
      const price = it.actualCostPrice ?? it.costPrice ?? 0
      const qty = it.purchasedQty ?? 0
      return sum + Number(price) * qty
    }, 0)

    await prisma.purchaseOrder.update({
      where: { id: item.purchaseOrderId },
      data: {
        status: nextStatus,
        totalActualAmount: new Prisma.Decimal(totalActual),
      },
    })

    return {
      success: true,
      message: 'อัปเดตรายการเรียบร้อยแล้ว',
      status: nextStatus,
    }
  } catch (error) {
    console.error('Error updating purchase order item:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตรายการ' }
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
    }

    await prisma.purchaseOrder.delete({
      where: { id },
    })

    return { success: true, message: 'ลบใบสั่งซื้อเรียบร้อยแล้ว' }
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการลบใบสั่งซื้อ' }
  }
}

