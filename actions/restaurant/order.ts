'use server'

import {
  KitchenItemStatus,
  OrderStatus,
  OrderType,
  PaymentMethod,
  ProductType,
  TableStatus,
} from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { generateOrderNumber } from '@/utils/order'

import { appEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'

export interface TableOrderItemInput {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  price: number
  originalPrice?: number
  costPrice?: number
  image?: string
  customerNote?: string
}

export interface SubmitTableOrderInput {
  tableToken: string
  items: TableOrderItemInput[]
  kitchenNote?: string
}

export async function submitTableOrder(input: SubmitTableOrderInput) {
  try {
    if (!input.items || input.items.length === 0) {
      return { success: false, messageTH: 'ไม่มีรายการอาหารในคำสั่งซื้อ' }
    }

    // 1. Look up table by QR Token
    const table = await prisma.restaurantTable.findUnique({
      where: { qrCodeToken: input.tableToken },
      include: {
        store: { select: { id: true, baseCurrency: true } },
        branch: { select: { id: true, name: true } },
      },
    })

    if (!table) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลโต๊ะอาหารหรือ QR Code ไม่ถูกต้อง',
      }
    }

    const storeId = table.storeId
    const branchId = table.branchId

    // 2. Find or create active TableSession
    let session = await prisma.tableSession.findFirst({
      where: {
        tableId: table.id,
        status: { in: [TableStatus.OCCUPIED, TableStatus.BILL_REQUESTED] },
      },
    })

    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableId: table.id,
          storeId,
          branchId,
          sessionCode: crypto.randomUUID(),
          guestCount: 1,
          status: TableStatus.OCCUPIED,
        },
      })
    }

    // 3. Calculate total amount
    const totalAmount = input.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    )

    const orderNumber = generateOrderNumber()

    // 4. Create Order & OrderItems in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          totalAmountBase: totalAmount,
          status: OrderStatus.PENDING,
          orderType: OrderType.DINE_IN,
          tableId: table.id,
          tableSessionId: session.id,
          kitchenNote: input.kitchenNote?.trim() || null,
          storeId,
          baseCurrency: table.store.baseCurrency,
          customerCurrency: table.store.baseCurrency,
          items: {
            create: input.items.map((item) => ({
              branchId,
              productType: ProductType.PHYSICAL,
              productId: item.productId,
              title: item.title,
              variantId: item.variantId,
              variantTitle: item.variantTitle,
              image: item.image || null,
              quantity: item.quantity,
              price: item.price,
              originalPrice: item.originalPrice ?? item.price,
              costPrice: item.costPrice ?? 0,
              customerNote: item.customerNote?.trim() || null,
              kitchenStatus: KitchenItemStatus.PENDING,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Update table status to OCCUPIED and link currentSessionId
      await tx.restaurantTable.update({
        where: { id: table.id },
        data: {
          status: TableStatus.OCCUPIED,
          currentSessionId: session.id,
        },
      })

      return newOrder
    })

    // 5. Real-time Pub/Sub Notifications via Redis
    // Notify general store orders
    appEvents.publish(`order:${storeId}`, {
      type: 'ORDER_CREATED',
      orderId: order.id,
    })

    // Notify Kitchen Display System (KDS)
    appEvents.publish(`kitchen:${storeId}`, {
      type: 'KITCHEN_ORDER_NEW',
      orderId: order.id,
      tableNumber: table.tableNumber,
      orderNumber: order.orderNumber,
      items: order.items,
      createdAt: order.createdAt,
    })

    // Notify Floor plan / Table Grid
    appEvents.publish(`table:${storeId}`, {
      type: 'TABLE_UPDATED',
      tableId: table.id,
      status: TableStatus.OCCUPIED,
    })

    return {
      success: true,
      data: serializeDecimal(order),
      messageTH: 'ส่งออเดอร์เข้าครัวเรียบร้อยแล้ว!',
      messageEN: 'Order sent to kitchen successfully!',
    }
  } catch (error) {
    console.error('Error submitting table order:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการส่งออเดอร์',
      messageEN: 'Failed to submit order',
    }
  }
}

// Request Bill from table
export async function requestTableBill({ tableToken }: { tableToken: string }) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { qrCodeToken: tableToken },
    })
    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะอาหาร' }
    }

    await prisma.restaurantTable.update({
      where: { id: table.id },
      data: { status: TableStatus.BILL_REQUESTED },
    })

    if (table.currentSessionId) {
      await prisma.tableSession.update({
        where: { id: table.currentSessionId },
        data: { status: TableStatus.BILL_REQUESTED },
      })
    }

    appEvents.publish(`table:${table.storeId}`, {
      type: 'TABLE_UPDATED',
      tableId: table.id,
      status: TableStatus.BILL_REQUESTED,
    })

    return {
      success: true,
      messageTH: 'ส่งคำขอเช็คบิลเรียบร้อยแล้ว พนักงานกำลังมาที่โต๊ะครับ',
      messageEN: 'Bill requested. Staff has been notified.',
    }
  } catch (error) {
    console.error('Error requesting bill:', error)
    return { success: false, messageTH: 'เกิดข้อผิดพลาดในการขอเช็คบิล' }
  }
}

// Get active orders for this table session
export async function getActiveTableOrders({
  tableToken,
}: {
  tableToken: string
}) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { qrCodeToken: tableToken },
      select: {
        id: true,
        tableNumber: true,
        currentSessionId: true,
      },
    })

    if (!table || !table.currentSessionId) {
      return { success: true, data: [] }
    }

    const orders = await prisma.order.findMany({
      where: {
        tableSessionId: table.currentSessionId,
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: serializeDecimal(orders) }
  } catch (error) {
    console.error('Error getting active table orders:', error)
    return { success: false, data: [] }
  }
}

// Settle bill and close table session at POS
export async function settleTableBill({
  tableId,
  paymentMethod = PaymentMethod.CASH_ON_DELIVERY,
  receivedAmount,
  changeAmount,
}: {
  tableId: string
  paymentMethod?: PaymentMethod
  receivedAmount?: number
  changeAmount?: number
}) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId },
      include: {
        sessions: {
          where: { status: { in: ['OCCUPIED', 'BILL_REQUESTED'] } },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะอาหาร' }
    }

    const session = table.sessions[0]
    if (!session) {
      return { success: false, messageTH: 'โต๊ะนี้ไม่มีรายการค้างชำระ' }
    }

    const now = new Date()

    await prisma.$transaction(async (tx) => {
      // Mark all orders in this session as PAID
      await tx.order.updateMany({
        where: {
          tableSessionId: session.id,
          status: { notIn: ['CANCELLED'] },
        },
        data: {
          status: OrderStatus.PAID,
          paymentMethod,
          paidAt: now,
        },
      })

      // Close the session
      await tx.tableSession.update({
        where: { id: session.id },
        data: {
          status: TableStatus.AVAILABLE,
          closedAt: now,
        },
      })

      // Set table back to AVAILABLE
      await tx.restaurantTable.update({
        where: { id: table.id },
        data: {
          status: TableStatus.AVAILABLE,
          currentSessionId: null,
        },
      })
    })

    appEvents.publish(`table:${table.storeId}`, {
      type: 'TABLE_UPDATED',
      tableId: table.id,
      status: TableStatus.AVAILABLE,
    })

    return {
      success: true,
      messageTH: 'ชำระเงินและปิดโต๊ะเรียบร้อยแล้ว',
      messageEN: 'Bill settled and table closed successfully',
    }
  } catch (error) {
    console.error('Error settling table bill:', error)
    return { success: false, messageTH: 'เกิดข้อผิดพลาดในการชำระเงิน' }
  }
}

// Fetch complete digital menu for the table's branch
export async function getTableMenu({ tableToken }: { tableToken: string }) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { qrCodeToken: tableToken },
      include: {
        zone: true,
        branch: { select: { id: true, name: true } },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            coverImage: true,
            primaryColor: true,
            baseCurrency: true,
          },
        },
      },
    })

    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะอาหาร' }
    }

    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { storeId: table.storeId },
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
      }),
      prisma.product.findMany({
        where: {
          storeId: table.storeId,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          details: true,
          categoryId: true,
          images: {
            select: { url: true, isPrimary: true },
          },
          variants: {
            where: { isAvailable: true },
            select: {
              id: true,
              title: true,
              price: true,
              image: true,
              isAvailable: true,
            },
          },
        },
        orderBy: { title: 'asc' },
      }),
    ])

    // Format products for client
    const formattedProducts = products.map((p) => ({
      id: p.id,
      title: p.title,
      description:
        typeof p.details === 'string'
          ? p.details
          : (p.details as any)?.description || '',
      categoryId: p.categoryId,
      image:
        p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || '',
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        price: Number(v.price),
        image: v.image || '',
      })),
      defaultPrice: p.variants[0] ? Number(p.variants[0].price) : 0,
    }))

    return {
      success: true,
      data: {
        table: {
          id: table.id,
          tableNumber: table.tableNumber,
          seats: table.seats,
          status: table.status,
          zoneName: table.zone?.name || null,
          branchName: table.branch.name,
        },
        store: table.store,
        categories: categories.map((c) => ({ id: c.id, name: c.title })),
        products: formattedProducts,
      },
    }
  } catch (error) {
    console.error('Error getting table menu:', error)
    return { success: false, messageTH: 'เกิดข้อผิดพลาดในการโหลดเมนูอาหาร' }
  }
}
