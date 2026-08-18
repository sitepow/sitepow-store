import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  LogAction,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from '@/generated/prisma/enums'
import { calculateDiscounts, calculateEarnedPoints } from '@/utils/cart'
import {
  calculateGroupShare,
  checkIsSplitOrder,
  classifyOrderItems,
  generateOrderNumber,
} from '@/utils/order'
import { deductCustomerPoints, refundCustomerPoints } from '@/utils/points'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

import { CancelOrderCoreInput, CreateOrderCoreInput } from './types'
import { calculateOrderDimensions } from './utils'

export async function createOrderCore(input: CreateOrderCoreInput) {
  if (!input.items || input.items.length === 0) {
    throw new Error('ไม่พบรายการสินค้าในคำสั่งซื้อ')
  }

  const store = await prisma.store.findUnique({
    where: { id: input.storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      phone: true,
      email: true,
      isPointsEnabled: true,
      pointEarningRate: true,
      pointRedeemRate: true,
    },
  })

  if (!store) {
    throw new Error('ไม่พบข้อมูลร้านค้า')
  }

  let customer = null
  let defaultAddress = null

  if (input.customerId) {
    customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
      include: {
        addresses: {
          where: input.addressId
            ? { id: input.addressId }
            : { isDefault: true },
          take: 1,
        },
      },
    })
    defaultAddress = customer?.addresses?.[0] ?? null
  }

  const hasPhysical = input.items.some(
    (item) => item.productType === ProductType.PHYSICAL,
  )
  if (hasPhysical && !input.isPOS && !defaultAddress) {
    throw new Error('ไม่พบข้อมูลที่อยู่จัดส่ง')
  }

  let bankAccountId = input.bankAccountId ?? null
  if (
    !bankAccountId &&
    (input.paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY ||
      input.paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY)
  ) {
    const defaultBank = await prisma.bankAccount.findFirst({
      where: { paymentSetting: { storeId: input.storeId }, isDefault: true },
      select: { id: true },
    })
    bankAccountId = defaultBank?.id ?? null
  }

  let couponData = undefined
  if (input.couponId) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: input.couponId },
    })

    if (!coupon || coupon.storeId !== store.id) {
      throw new Error('ไม่พบรหัสส่วนลดนี้')
    }

    const now = new Date()
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new Error('รหัสส่วนลดนี้หมดอายุหรือยังไม่เริ่มใช้งาน')
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('รหัสส่วนลดนี้ถูกใช้งานครบจำนวนแล้ว')
    }

    const subtotalAll = input.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    )
    if (subtotalAll < Number(coupon.minOrderAmount ?? 0)) {
      throw new Error('ยอดสั่งซื้อไม่ถึงขั้นต่ำสำหรับรหัสส่วนลดนี้')
    }

    couponData = {
      discountType: coupon.discountType,
      discountAmount: Number(coupon.discountAmount),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    }
  }

  const variantIds = Array.from(
    new Set(input.items.map((i) => i.variantId).filter(Boolean)),
  )

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds as string[] } },
    select: {
      id: true,
      weight: true,
      width: true,
      height: true,
      length: true,
      costPrice: true,
    },
  })
  const variantMap = new Map(variants.map((v) => [v.id, v]))
  const dimensions = calculateOrderDimensions(input.items, variantMap)

  const classified = classifyOrderItems(input.items)
  const { physicalGroups, digitalItems, digitalServices } = classified

  const subtotalAll = input.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  )

  const { couponDiscount, pointsDiscount } = calculateDiscounts({
    subtotal: subtotalAll,
    coupon: couponData,
    usedPoints: input.usedPoints ?? 0,
    pointRedeemRate: Number(store.pointRedeemRate ?? 0),
  })

  const manualDiscount = input.discountAmount ?? 0
  const grandTotal = Math.max(
    0,
    subtotalAll +
      (input.shippingFee ?? 0) -
      couponDiscount -
      pointsDiscount -
      manualDiscount,
  )

  const calculatedEarnedPoints = store.isPointsEnabled
    ? (input.earnedPoints ??
      calculateEarnedPoints(grandTotal, Number(store.pointEarningRate ?? 0)))
    : 0

  const branchIds = Object.keys(physicalGroups)
  const isSplitOrder = checkIsSplitOrder(classified)

  const createdOrders = await prisma.$transaction(async (tx) => {
    if (input.couponId) {
      const coupon = await tx.coupon.findUnique({
        where: { id: input.couponId },
        select: { usageLimit: true, usedCount: true },
      })

      if (
        coupon &&
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        throw new Error('รหัสส่วนลดนี้ถูกใช้งานครบจำนวนแล้ว')
      }

      const updatedCoupon = await tx.coupon.updateMany({
        where: {
          id: input.couponId,
          ...(coupon?.usageLimit != null
            ? { usedCount: { lt: coupon.usageLimit } }
            : {}),
        },
        data: { usedCount: { increment: 1 } },
      })

      if (updatedCoupon.count === 0) {
        throw new Error('รหัสส่วนลดนี้ถูกใช้งานเต็มสิทธิ์แล้ว')
      }
    }

    if (input.customerId && input.usedPoints && input.usedPoints > 0) {
      const customerStore = await tx.customerStore.findUnique({
        where: {
          customerId_storeId: {
            customerId: input.customerId,
            storeId: store.id,
          },
        },
        select: { rewardPoints: true },
      })

      const currentPoints = customerStore?.rewardPoints ?? 0
      if (currentPoints < input.usedPoints) {
        throw new Error(`แต้มสะสมไม่เพียงพอ (คุณมี ${currentPoints} แต้ม)`)
      }

      await deductCustomerPoints({
        tx,
        customerId: input.customerId,
        storeId: store.id,
        usedPoints: input.usedPoints,
      })
    }

    const orders = []
    const rawOrderNumber = generateOrderNumber()
    const baseOrderNumber = input.isPOS
      ? `POS-${rawOrderNumber}`
      : rawOrderNumber
    let orderCounter = 1

    const defaultStatus =
      input.status ??
      (input.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
        ? OrderStatus.SHIPPED
        : OrderStatus.PENDING)

    for (const branchKey of branchIds) {
      const targetBranchId = branchKey || input.branchId
      if (!targetBranchId) {
        throw new Error('ระบุสาขาไม่ถูกต้องสำหรับสินค้า Physical')
      }

      const groupItems = physicalGroups[branchKey]
      const groupSubtotal = groupItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      )

      const share = calculateGroupShare({
        groupSubtotal,
        totalGrandSubtotal: subtotalAll,
        totalShippingFee: input.shippingFee ?? 0,
        branchCount: branchIds.length,
        couponDiscount,
        pointsDiscount,
        manualDiscount,
        usedPoints: input.usedPoints ?? 0,
        earnedPoints: calculatedEarnedPoints,
      })

      const groupTotal = Math.max(
        0,
        groupSubtotal +
          share.shippingFee -
          share.couponDiscount -
          share.pointsDiscount -
          share.manualDiscount,
      )

      for (const item of groupItems) {
        const updateResult = await tx.productStock.updateMany({
          where: {
            branchId: targetBranchId,
            variantId: item.variantId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        })

        if (updateResult.count === 0) {
          throw new Error(
            `สินค้า "${item.title} (${item.variantTitle})" ในสาขานี้มีสต็อกไม่เพียงพอ`,
          )
        }
      }

      const subOrderNumber = isSplitOrder
        ? `${baseOrderNumber}-${orderCounter++}`
        : baseOrderNumber

      const order = await tx.order.create({
        data: {
          orderNumber: subOrderNumber,
          totalAmount: groupTotal,
          totalAmountBase: groupTotal,
          status: defaultStatus,
          paidAt:
            defaultStatus === OrderStatus.PAID ||
            defaultStatus === OrderStatus.SHIPPED
              ? new Date()
              : null,
          storeId: store.id,
          customerId: input.customerId ?? null,
          employeeId: input.employeeId ?? null,
          couponId: input.couponId ?? null,
          paymentMethod: input.paymentMethod,
          bankAccountId,
          shippingMethod: input.shippingMethod ?? null,
          shippingFee: share.shippingFee,
          usedPoints: share.usedPoints,
          pointsDiscount: share.pointsDiscount,
          earnedPoints: share.earnedPoints,
          pointRedeemRateSnapshot: store.pointRedeemRate,
          pointEarningRateSnapshot: store.pointEarningRate,
          storeSnapshot: store as unknown as Prisma.InputJsonValue,
          shippingAddrSnapshot: defaultAddress
            ? (defaultAddress as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          totalWeight: dimensions.totalWeight,
          width: dimensions.width,
          height: dimensions.height,
          length: dimensions.length,
          items: {
            create: groupItems.map((item) => {
              const variant = variantMap.get(item.variantId)
              return {
                productId: item.productId,
                variantId: item.variantId,
                title: item.title,
                variantTitle: item.variantTitle,
                image: item.variant?.image || item.image || null,
                quantity: item.quantity,
                price: item.price,
                originalPrice: item.originalPrice ?? item.price,
                costPrice: variant?.costPrice ?? 0,
                branchId: targetBranchId,
                productType: item.productType,
                customerNote: item.customerNote ?? null,
              }
            }),
          },
        },
        include: { items: true, bankAccount: true },
      })
      orders.push(order)
    }

    if (digitalItems.length > 0) {
      const digitalSubtotal = digitalItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      )
      const share = calculateGroupShare({
        groupSubtotal: digitalSubtotal,
        totalGrandSubtotal: subtotalAll,
        totalShippingFee: 0,
        branchCount: branchIds.length,
        couponDiscount,
        pointsDiscount,
        manualDiscount,
        usedPoints: input.usedPoints ?? 0,
        earnedPoints: calculatedEarnedPoints,
      })

      const digitalTotal = Math.max(
        0,
        digitalSubtotal -
          share.couponDiscount -
          share.pointsDiscount -
          share.manualDiscount,
      )

      const subOrderNumber = isSplitOrder
        ? `${baseOrderNumber}-${orderCounter++}`
        : baseOrderNumber

      const mainBranch = await tx.branch.findFirst({
        where: { storeId: store.id, isMain: true },
        select: { id: true },
      })

      const order = await tx.order.create({
        data: {
          orderNumber: subOrderNumber,
          totalAmount: digitalTotal,
          totalAmountBase: digitalTotal,
          status: defaultStatus,
          paidAt:
            defaultStatus === OrderStatus.PAID ||
            defaultStatus === OrderStatus.SHIPPED
              ? new Date()
              : null,
          storeId: store.id,
          customerId: input.customerId ?? null,
          employeeId: input.employeeId ?? null,
          paymentMethod: input.paymentMethod,
          bankAccountId,
          shippingFee: 0,
          usedPoints: share.usedPoints,
          pointsDiscount: share.pointsDiscount,
          earnedPoints: share.earnedPoints,
          storeSnapshot: store as unknown as Prisma.InputJsonValue,
          items: {
            create: digitalItems.map((item) => {
              const variant = variantMap.get(item.variantId)
              return {
                productId: item.productId,
                variantId: item.variantId,
                title: item.title,
                variantTitle: item.variantTitle,
                image: item.variant?.image || item.image || null,
                quantity: item.quantity,
                price: item.price,
                originalPrice: item.originalPrice ?? item.price,
                costPrice: variant?.costPrice ?? 0,
                branchId: input.branchId || mainBranch?.id || '',
                productType: item.productType,
                customerNote: item.customerNote ?? null,
              }
            }),
          },
        },
        include: { items: true, bankAccount: true },
      })

      for (const item of digitalItems) {
        const availableItems = await tx.digitalItem.findMany({
          where: { variantId: item.variantId, isUsed: false },
          take: item.quantity,
          select: { id: true },
        })

        if (availableItems.length < item.quantity) {
          throw new Error(
            `สินค้าดิจิทัล "${item.title} (${item.variantTitle})" มีจำนวนไม่เพียงพอ`,
          )
        }

        const assignResult = await tx.digitalItem.updateMany({
          where: {
            id: { in: availableItems.map((i) => i.id) },
            isUsed: false,
          },
          data: { isUsed: true, orderId: order.id },
        })

        if (assignResult.count < item.quantity) {
          throw new Error(
            `เกิดข้อผิดพลาดในการดึงรหัสสินค้าดิจิทัลของ "${item.title}" กรุณาลองใหม่อีกครั้ง`,
          )
        }
      }
      orders.push(order)
    }

    if (digitalServices.length > 0) {
      const mainBranch = await tx.branch.findFirst({
        where: { storeId: store.id, isMain: true },
        select: { id: true },
      })

      for (const serviceItem of digitalServices) {
        const serviceSubtotal = serviceItem.price * serviceItem.quantity
        const share = calculateGroupShare({
          groupSubtotal: serviceSubtotal,
          totalGrandSubtotal: subtotalAll,
          totalShippingFee: 0,
          branchCount: branchIds.length,
          couponDiscount,
          pointsDiscount,
          manualDiscount,
          usedPoints: input.usedPoints ?? 0,
          earnedPoints: calculatedEarnedPoints,
        })

        const serviceTotal = Math.max(
          0,
          serviceSubtotal -
            share.couponDiscount -
            share.pointsDiscount -
            share.manualDiscount,
        )

        const subOrderNumber = isSplitOrder
          ? `${baseOrderNumber}-${orderCounter++}`
          : baseOrderNumber

        const variant = variantMap.get(serviceItem.variantId)

        const order = await tx.order.create({
          data: {
            orderNumber: subOrderNumber,
            totalAmount: serviceTotal,
            totalAmountBase: serviceTotal,
            status: defaultStatus,
            paidAt:
              defaultStatus === OrderStatus.PAID ||
              defaultStatus === OrderStatus.SHIPPED
                ? new Date()
                : null,
            storeId: store.id,
            customerId: input.customerId ?? null,
            employeeId: input.employeeId ?? null,
            paymentMethod: input.paymentMethod,
            bankAccountId,
            shippingFee: 0,
            usedPoints: share.usedPoints,
            pointsDiscount: share.pointsDiscount,
            earnedPoints: share.earnedPoints,
            storeSnapshot: store as unknown as Prisma.InputJsonValue,
            items: {
              create: [
                {
                  productId: serviceItem.productId,
                  variantId: serviceItem.variantId,
                  title: serviceItem.title,
                  variantTitle: serviceItem.variantTitle,
                  image:
                    serviceItem.variant?.image || serviceItem.image || null,
                  quantity: serviceItem.quantity,
                  price: serviceItem.price,
                  originalPrice: serviceItem.originalPrice ?? serviceItem.price,
                  costPrice: variant?.costPrice ?? 0,
                  branchId: input.branchId || mainBranch?.id || '',
                  productType: serviceItem.productType,
                  customerNote: serviceItem.customerNote ?? null,
                },
              ],
            },
          },
          include: { items: true, bankAccount: true },
        })
        orders.push(order)
      }
    }

    if (input.customerId) {
      await tx.customerStore.upsert({
        where: {
          customerId_storeId: {
            customerId: input.customerId,
            storeId: store.id,
          },
        },
        create: {
          customerId: input.customerId,
          storeId: store.id,
          totalSpent: grandTotal,
          rewardPoints: 0,
        },
        update: {
          totalSpent: { increment: grandTotal },
        },
      })
    }

    return orders
  })

  await createLog({
    action: LogAction.CREATE_ORDER,
    actorType: input.isPOS ? ActorType.MERCHANT : ActorType.SYSTEM,
    storeId: store.id,
    entity: 'Order',
    entityId: createdOrders[0]?.id || '',
    details: {
      type: input.isPOS ? 'POS' : 'STOREFRONT',
      orderCount: createdOrders.length,
      orderNumbers: createdOrders.map((o) => o.orderNumber),
      paymentMethod: input.paymentMethod,
      receivedAmount: input.receivedAmount,
      changeAmount: input.changeAmount,
    },
  })

  return createdOrders
}

export async function cancelOrderCore(input: CancelOrderCoreInput) {
  const { orderId, actorType = ActorType.SYSTEM } = input

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      storeId: true,
      orderNumber: true,
      status: true,
      customerId: true,
      totalAmount: true,
      usedPoints: true,
      earnedPoints: true,
      couponId: true,
      items: {
        select: {
          quantity: true,
          variantId: true,
          branchId: true,
          productType: true,
        },
      },
    },
  })

  if (!order) {
    throw new Error('ไม่พบข้อมูลคำสั่งซื้อ')
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error('คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว')
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (
        item.productType === ProductType.PHYSICAL &&
        item.variantId &&
        item.branchId
      ) {
        const variantExists = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true },
        })

        const branchExists = await tx.branch.findUnique({
          where: { id: item.branchId },
          select: { id: true },
        })

        if (variantExists && branchExists) {
          await tx.productStock.upsert({
            where: {
              branchId_variantId: {
                branchId: item.branchId,
                variantId: item.variantId,
              },
            },
            update: {
              quantity: { increment: item.quantity },
            },
            create: {
              branchId: item.branchId,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          })
        } else {
          console.warn(
            `[CancelOrder] Cannot restore stock for variant ${item.variantId} in branch ${item.branchId} because it no longer exists.`,
          )
        }
      }
    }

    await tx.digitalItem.updateMany({
      where: { orderId: order.id },
      data: {
        orderId: null,
        isUsed: false,
      },
    })

    if (order.customerId) {
      if (order.usedPoints && order.usedPoints > 0) {
        await refundCustomerPoints({
          tx,
          customerId: order.customerId,
          storeId: order.storeId,
          usedPoints: order.usedPoints,
        })
      }

      const amountToDeduct = Number(order.totalAmount ?? 0)
      if (amountToDeduct > 0) {
        await tx.customerStore.update({
          where: {
            customerId_storeId: {
              customerId: order.customerId,
              storeId: order.storeId,
            },
          },
          data: {
            totalSpent: {
              decrement: amountToDeduct,
            },
          },
        })
      }
    }

    if (order.couponId) {
      await tx.coupon.updateMany({
        where: {
          id: order.couponId,
          usedCount: { gt: 0 },
        },
        data: {
          usedCount: { decrement: 1 },
        },
      })
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    })
  })

  await createLog({
    action: LogAction.CANCEL_ORDER,
    actorType: actorType as ActorType,
    storeId: order.storeId,
    entity: 'Order',
    entityId: order.id,
    details: {
      orderNumber: order.orderNumber,
      from: order.status,
      to: OrderStatus.CANCELLED,
    },
  })

  return true
}
