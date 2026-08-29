'use server'

import {
  AgreementStatus,
  DefaultRole,
  DiscountType,
  OrderStatus,
  PayoutStatus,
  Prisma,
  ResellerType,
} from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { OrderEventPayload, chatEvents } from '@/lib/events'
import { findOrCreateEmployee } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { invalidateEmployeePermissionCache } from './query-keys/invalidation/permission'

export interface CreateResellerPOSOrderInput {
  supplierStoreId: string
  branchId: string
  agreementId: string
  items: {
    variantId: string
    quantity: number
  }[]
}

export async function createResellerPOSOrder(
  input: CreateResellerPOSOrderInput,
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const agreement = await prisma.resellerAgreement.findUnique({
      where: { id: input.agreementId },
      include: {
        customPrices: true,
      },
    })

    const now = new Date()
    const isExpired =
      agreement?.expiresAt && new Date(agreement.expiresAt) < now

    if (
      !agreement ||
      agreement.status !== AgreementStatus.ACTIVE ||
      isExpired
    ) {
      return {
        success: false,
        message: 'สัญญาฝากขายไม่อยู่ในสถานะใช้งาน หรือสัญญาหมดอายุแล้ว',
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let orderTotal = new Prisma.Decimal(0)
      const orderItemsData = []

      for (const item of input.items) {
        const stock = await tx.resellerStock.findUnique({
          where: {
            agreementId_variantId: {
              agreementId: input.agreementId,
              variantId: item.variantId,
            },
          },
          include: { variant: { include: { product: true } } },
        })

        if (!stock) {
          throw new Error('ไม่พบข้อมูลสต็อกสินค้าในสัญญาฝากขาย')
        }

        const availableToSell = stock.acceptedQuantity - stock.soldQuantity
        if (availableToSell < item.quantity) {
          throw new Error(
            `สต็อกพร้อมขายของสินค้า ${stock.variant.title} ไม่เพียงพอ (พร้อมขาย: ${availableToSell} ชิ้น)`,
          )
        }

        const updatedStock = await tx.resellerStock.updateMany({
          where: {
            id: stock.id,
            acceptedQuantity: { gte: stock.soldQuantity + item.quantity },
          },
          data: {
            soldQuantity: { increment: item.quantity },
          },
        })

        if (updatedStock.count === 0) {
          throw new Error(
            `ไม่สามารถตัดสต็อกสินค้า ${stock.variant.title} ได้ เนื่องจากสต็อกถูกทำรายการไปก่อนหน้า`,
          )
        }

        const customPrice = agreement.customPrices.find(
          (cp) => cp.variantId === item.variantId,
        )
        let finalPrice = stock.variant.price

        if (customPrice?.specialPrice) {
          finalPrice = customPrice.specialPrice
        } else if (
          customPrice?.discountType === DiscountType.FIXED &&
          customPrice.discountAmount != null
        ) {
          finalPrice = stock.variant.price.sub(customPrice.discountAmount)
        } else if (
          customPrice?.discountType === DiscountType.PERCENTAGE &&
          customPrice.discountAmount != null
        ) {
          const discount = stock.variant.price
            .mul(customPrice.discountAmount)
            .div(100)
          finalPrice = stock.variant.price.sub(discount)
        } else if (
          agreement.defaultDiscountType &&
          agreement.defaultDiscountAmount
        ) {
          if (agreement.defaultDiscountType === DiscountType.PERCENTAGE) {
            const discount = stock.variant.price
              .mul(agreement.defaultDiscountAmount)
              .div(100)
            finalPrice = stock.variant.price.sub(discount)
          } else if (agreement.defaultDiscountType === DiscountType.FIXED) {
            finalPrice = stock.variant.price.sub(
              agreement.defaultDiscountAmount,
            )
          }
        }

        if (finalPrice.lessThan(0)) {
          finalPrice = new Prisma.Decimal(0)
        }

        const itemTotal = finalPrice.mul(item.quantity)
        orderTotal = orderTotal.add(itemTotal)

        orderItemsData.push({
          branchId: input.branchId,
          productId: stock.variant.productId,
          productType: stock.variant.product.productType,
          title: stock.variant.product.title,
          variantId: item.variantId,
          variantTitle: stock.variant.title,
          image: stock.variant.image,
          quantity: item.quantity,
          originalPrice: stock.variant.price,
          price: finalPrice,
          costPrice: stock.variant.costPrice,
        })
      }

      const order = await tx.order.create({
        data: {
          storeId: input.supplierStoreId,
          orderNumber: `RS-POS-${Date.now()}`,
          totalAmount: orderTotal,
          totalAmountBase: orderTotal,
          status: OrderStatus.PENDING,
          resellerAgreementId: input.agreementId,
          items: {
            create: orderItemsData,
          },
        },
      })

      return order
    })

    chatEvents.publish<OrderEventPayload>(`order:${input.supplierStoreId}`, {
      type: 'ORDER_CREATED',
      orderId: result.id,
    })

    return {
      success: true,
      message: 'สร้างคำสั่งซื้อฝากขายสำเร็จ รอการชำระเงิน',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
    console.error(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการทำรายการ',
    }
  }
}
export async function getResellerStocks(agreementId: string) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (!agreementId) {
      return { success: true, data: [] }
    }

    const stocks = await prisma.resellerStock.findMany({
      where: { agreementId },
      include: {
        agreement: {
          select: {
            defaultDiscountType: true,
            defaultDiscountAmount: true,
          },
        },
        variant: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
            resellerPrices: {
              where: { agreementId },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedStocks = stocks.map((stock) => {
      const customPriceData = stock.variant?.resellerPrices?.[0]
      let customPrice = null

      if (customPriceData) {
        if (customPriceData.specialPrice) {
          customPrice = Number(customPriceData.specialPrice)
        } else if (customPriceData.discountAmount) {
          const originalPrice = Number(stock.variant.price)
          const discount = Number(customPriceData.discountAmount)

          customPrice =
            customPriceData.discountType === DiscountType.PERCENTAGE
              ? originalPrice - (originalPrice * discount) / 100
              : originalPrice - discount
        }
      }

      const defaultCommissionRate =
        stock.agreement?.defaultDiscountType === DiscountType.PERCENTAGE
          ? Number(stock.agreement?.defaultDiscountAmount || 0)
          : 0

      return {
        ...stock,
        customPrice,
        defaultCommissionRate,
      }
    })

    return {
      success: true,
      data: serializeDecimal(formattedStocks),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการดึงข้อมูลสต็อก',
    }
  }
}

export interface AllocateResellerStockInput {
  agreementId: string
  variantId: string
  quantity: number
}

export async function allocateResellerStock(input: AllocateResellerStockInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (input.quantity <= 0) {
      return { success: false, message: 'จำนวนจัดสรรต้องมากกว่า 0' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const agreement = await tx.resellerAgreement.findUnique({
        where: { id: input.agreementId },
        select: { supplierStoreId: true },
      })

      if (!agreement) {
        throw new Error('ไม่พบข้อมูลสัญญาฝากขาย')
      }

      const mainStock = await tx.productStock.findFirst({
        where: {
          variantId: input.variantId,
          branch: { storeId: agreement.supplierStoreId },
        },
      })

      if (!mainStock) {
        throw new Error('ไม่พบข้อมูลสต็อกสินค้าในคลังหลัก')
      }

      const updatedMainStock = await tx.productStock.updateMany({
        where: {
          id: mainStock.id,
          quantity: { gte: input.quantity },
        },
        data: {
          quantity: { decrement: input.quantity },
        },
      })

      if (updatedMainStock.count === 0) {
        throw new Error('สต็อกหลักไม่พอสำหรับจัดสรร (อาจมีรายการตัดสต็อกซ้อน)')
      }

      const resellerStock = await tx.resellerStock.upsert({
        where: {
          agreementId_variantId: {
            agreementId: input.agreementId,
            variantId: input.variantId,
          },
        },
        update: {
          allocatedQuantity: { increment: input.quantity },
          acceptedAt: null,
        },
        create: {
          agreementId: input.agreementId,
          variantId: input.variantId,
          allocatedQuantity: input.quantity,
          soldQuantity: 0,
          acceptedAt: null,
        },
      })

      return resellerStock
    })

    return {
      success: true,
      message: 'เพิ่มสต็อกฝากขายเรียบร้อยแล้ว (รอตัวแทนกดรับสินค้า)',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเติมสต็อก',
    }
  }
}

export interface AcceptResellerStockInput {
  agreementId: string
  variantId: string
  quantity?: number
}

export async function acceptResellerStock(input: AcceptResellerStockInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.resellerStock.findUnique({
        where: {
          agreementId_variantId: {
            agreementId: input.agreementId,
            variantId: input.variantId,
          },
        },
      })

      if (!stock) {
        throw new Error('ไม่พบข้อมูลรายการสินค้าฝากขายนี้')
      }

      const pendingQuantity = stock.allocatedQuantity - stock.acceptedQuantity

      if (pendingQuantity <= 0) {
        throw new Error('ไม่มีรายการสินค้าค้างรับ')
      }

      const acceptAmount = input.quantity
        ? Math.min(input.quantity, pendingQuantity)
        : pendingQuantity

      const updatedStock = await tx.resellerStock.update({
        where: { id: stock.id },
        data: {
          acceptedAt: new Date(),
          acceptedQuantity: { increment: acceptAmount },
        },
      })

      return updatedStock
    })

    return {
      success: true,
      message: 'ยืนยันการรับสินค้าเข้าสต็อกเรียบร้อยแล้ว',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการยืนยันรับสินค้า',
    }
  }
}

export async function getResellerPayoutSummary(agreementId: string) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (!agreementId) {
      return {
        success: true,
        data: {
          commissionRate: null,
          totalGrossSales: 0,
          totalCommission: 0,
          totalPaidAmount: 0,
          pendingPayoutAmount: 0,
        },
      }
    }

    const agreement = await prisma.resellerAgreement.findUnique({
      where: { id: agreementId },
    })

    if (!agreement) {
      return { success: false, message: 'ไม่พบข้อมูลสัญญาฝากขาย' }
    }

    const orders = await prisma.order.findMany({
      where: {
        resellerAgreementId: agreementId,
        status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED] },
      },
      include: {
        items: true,
      },
    })

    const stocks = await prisma.resellerStock.findMany({
      where: { agreementId },
      include: { variant: { select: { id: true, price: true } } },
    })
    const variantPriceMap = new Map(
      stocks.map((s) => [s.variantId, s.variant.price]),
    )

    let totalGrossSales = new Prisma.Decimal(0)
    let totalMerchantCost = new Prisma.Decimal(0)
    let totalCommission = new Prisma.Decimal(0)

    for (const order of orders) {
      for (const item of order.items) {
        const actualSoldPrice = new Prisma.Decimal(item.price || 0)

        const variantPrice = item.variantId
          ? variantPriceMap.get(item.variantId)
          : null

        const originalRetailPrice = item.originalPrice
          ? new Prisma.Decimal(item.originalPrice)
          : variantPrice
            ? new Prisma.Decimal(variantPrice)
            : actualSoldPrice

        const qty = new Prisma.Decimal(item.quantity || 0)

        const itemGross = originalRetailPrice.mul(qty)
        totalGrossSales = totalGrossSales.add(itemGross)

        const itemMerchantCost = actualSoldPrice.mul(qty)
        totalMerchantCost = totalMerchantCost.add(itemMerchantCost)

        const discountPerUnit = originalRetailPrice.sub(actualSoldPrice)
        if (discountPerUnit.greaterThan(0)) {
          const itemCommission = discountPerUnit.mul(qty)
          totalCommission = totalCommission.add(itemCommission)
        }
      }
    }

    const paidPayouts = await prisma.resellerPayout.aggregate({
      where: {
        agreementId,
        status: PayoutStatus.PAID,
      },
      _sum: {
        amount: true,
      },
    })

    const totalPaidAmount = paidPayouts._sum.amount || new Prisma.Decimal(0)

    const pendingPayoutAmount = totalMerchantCost.sub(totalPaidAmount)

    const commissionRate =
      agreement.defaultDiscountType === DiscountType.PERCENTAGE
        ? Number(agreement.defaultDiscountAmount || 0)
        : null

    return {
      success: true,
      data: serializeDecimal({
        commissionRate,
        totalGrossSales,
        totalCommission,
        totalPaidAmount,
        pendingPayoutAmount: pendingPayoutAmount.lessThan(0)
          ? new Prisma.Decimal(0)
          : pendingPayoutAmount,
      }),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการคำนวณสรุปยอดเบิกจ่าย',
    }
  }
}

export interface CreateResellerPayoutInput {
  agreementId: string
  amount: number
  paymentProof?: string
  note?: string
}

export async function createResellerPayout(input: CreateResellerPayoutInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const payout = await prisma.resellerPayout.create({
      data: {
        agreementId: input.agreementId,
        amount: new Prisma.Decimal(input.amount),
        status: input.paymentProof ? PayoutStatus.PAID : PayoutStatus.PENDING,
        paymentProof: input.paymentProof,
        paidAt: input.paymentProof ? new Date() : null,
        note: input.note,
      },
    })

    return {
      success: true,
      message: input.paymentProof
        ? 'บันทึกการจ่ายเงินสำเร็จ'
        : 'ยื่นขอเบิกจ่ายเงินสำเร็จ',
      data: serializeDecimal(payout),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการบันทึก Payout',
    }
  }
}

export async function getResellerAgreements(storeId: string) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const agreements = await prisma.resellerAgreement.findMany({
      where: {
        supplierStoreId: storeId,
      },
      include: {
        resellerStore: true,
        resellerUser: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: serializeDecimal(agreements),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการดึงข้อมูลสัญญา',
    }
  }
}

export interface CreateResellerAgreementInput {
  supplierStoreId: string
  resellerType: ResellerType
  resellerStoreId?: string
  resellerCustomerId?: string
  commissionRate: number
  targetBranchId?: string
}

export async function createResellerAgreement(
  data: CreateResellerAgreementInput,
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (!data.supplierStoreId) {
      return { success: false, message: 'กรุณาระบุร้านค้าผู้ให้ฝากขาย' }
    }

    let resellerUserId: string | null = null

    if (
      data.resellerType === ResellerType.EXTERNAL &&
      data.resellerCustomerId
    ) {
      const targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: data.resellerCustomerId },
            { email: data.resellerCustomerId },
          ],
        },
        select: { id: true, name: true, email: true },
      })

      if (!targetUser) {
        return {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งานที่ตรงกับ Email หรือ ID ที่ระบุ',
        }
      }

      resellerUserId = targetUser.id
    }

    const result = await prisma.$transaction(async (tx) => {
      const agreement = await tx.resellerAgreement.create({
        data: {
          supplierStoreId: data.supplierStoreId,
          resellerType: data.resellerType,
          resellerStoreId:
            data.resellerType === ResellerType.INTERNAL_STORE
              ? data.resellerStoreId
              : null,
          resellerCustomerId:
            data.resellerType === ResellerType.EXTERNAL ? resellerUserId : null,
          defaultDiscountAmount: data.commissionRate,
          defaultDiscountType: DiscountType.PERCENTAGE,
          status: AgreementStatus.ACTIVE,
        },
      })

      let targetUserId: string | null =
        data.resellerType === ResellerType.EXTERNAL ? resellerUserId : null

      if (
        data.resellerType === ResellerType.INTERNAL_STORE &&
        data.resellerStoreId
      ) {
        const resellerStore = await tx.store.findUnique({
          where: { id: data.resellerStoreId },
          select: { ownerId: true },
        })
        targetUserId = resellerStore?.ownerId || null
      }

      if (targetUserId) {
        const targetUser = await tx.user.findUnique({
          where: { id: targetUserId },
          select: { name: true, email: true },
        })

        if (targetUser && targetUser.email) {
          const { employee } = await findOrCreateEmployee({
            email: targetUser.email,
            name: targetUser.name || 'Reseller Partner',
          })

          const alreadyInStore = await tx.employeeStore.findUnique({
            where: {
              storeId_employeeId: {
                employeeId: employee.id,
                storeId: data.supplierStoreId,
              },
            },
            select: { id: true },
          })

          let resellerRole = await tx.role.findUnique({
            where: {
              storeId_name: {
                storeId: data.supplierStoreId,
                name: DefaultRole.POS_RESELLER,
              },
            },
          })

          if (!resellerRole) {
            resellerRole = await tx.role.create({
              data: {
                storeId: data.supplierStoreId,
                name: DefaultRole.POS_RESELLER,
              },
            })
          }

          let targetBranchId = data.targetBranchId
          if (!targetBranchId) {
            const mainBranch = await tx.branch.findFirst({
              where: {
                storeId: data.supplierStoreId,
                isMain: true,
              },
              select: { id: true },
            })
            targetBranchId = mainBranch?.id
          }

          if (targetBranchId && !alreadyInStore) {
            await tx.employeeStore.create({
              data: {
                employeeId: employee.id,
                storeId: data.supplierStoreId,
                branches: {
                  create: [
                    {
                      branchId: targetBranchId,
                      roleId: resellerRole.id,
                    },
                  ],
                },
              },
            })

            if (employee.userId) {
              await invalidateEmployeePermissionCache(
                employee.userId,
                data.supplierStoreId,
              )
            }
          }
        }
      }

      return agreement
    })

    return {
      success: true,
      message: 'สร้างสัญญาและกำหนดสิทธิ์ตัวแทนจำหน่ายสำเร็จ',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
    console.error(error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการสร้างสัญญา',
    }
  }
}

export interface ReturnResellerStockInput {
  agreementId: string
  variantId: string
  quantity: number
  targetBranchId: string
}

export async function returnResellerStock(input: ReturnResellerStockInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (input.quantity <= 0) {
      return { success: false, message: 'จำนวนที่ต้องการคืนต้องมากกว่า 0' }
    }

    if (!input.targetBranchId) {
      return { success: false, message: 'กรุณาระบุสาขาปลายทางที่ต้องการรับคืน' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const resellerStock = await tx.resellerStock.findUnique({
        where: {
          agreementId_variantId: {
            agreementId: input.agreementId,
            variantId: input.variantId,
          },
        },
      })

      if (!resellerStock) {
        throw new Error('ไม่พบรายการสต็อกฝากขายสินค้าชิ้นนี้')
      }

      const unacceptedQuantity =
        resellerStock.allocatedQuantity - resellerStock.acceptedQuantity
      const availableToReturn =
        resellerStock.acceptedQuantity -
        resellerStock.soldQuantity +
        unacceptedQuantity

      if (input.quantity > availableToReturn) {
        throw new Error(
          `ไม่สามารถดึงคืนได้เกินจำนวนที่คงเหลือ (คงเหลือที่คืนได้: ${availableToReturn} ชิ้น)`,
        )
      }

      let returnRemaining = input.quantity
      let deductUnaccepted = 0
      let deductAccepted = 0

      if (unacceptedQuantity > 0) {
        deductUnaccepted = Math.min(unacceptedQuantity, returnRemaining)
        returnRemaining -= deductUnaccepted
      }

      if (returnRemaining > 0) {
        deductAccepted = returnRemaining
      }

      const newAllocatedQuantity =
        resellerStock.allocatedQuantity - input.quantity
      const newAcceptedQuantity =
        resellerStock.acceptedQuantity - deductAccepted

      let updatedResellerStock
      if (newAllocatedQuantity === 0 && resellerStock.soldQuantity === 0) {
        updatedResellerStock = await tx.resellerStock.delete({
          where: { id: resellerStock.id },
        })
      } else {
        updatedResellerStock = await tx.resellerStock.update({
          where: { id: resellerStock.id },
          data: {
            allocatedQuantity: newAllocatedQuantity,
            acceptedQuantity: newAcceptedQuantity,
          },
        })
      }

      await tx.productStock.upsert({
        where: {
          branchId_variantId: {
            branchId: input.targetBranchId,
            variantId: input.variantId,
          },
        },
        update: {
          quantity: { increment: input.quantity },
        },
        create: {
          branchId: input.targetBranchId,
          variantId: input.variantId,
          quantity: input.quantity,
        },
      })

      return updatedResellerStock
    })

    return {
      success: true,
      message: 'รับคืนสต็อกเข้าสาขาเรียบร้อยแล้ว',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการดึงคืนสต็อก',
    }
  }
}

export async function getResellerAgreementInfo(storeId: string) {
  if (!storeId) {
    return null
  }

  try {
    const agreement = await prisma.resellerAgreement.findFirst({
      where: {
        resellerStoreId: storeId,
        status: AgreementStatus.ACTIVE,
      },
      include: {
        stocks: true,
        customPrices: true,
      },
    })

    return agreement
  } catch (error) {
    console.error(error)
    return null
  }
}

export interface UpsertResellerCustomPriceInput {
  agreementId: string
  variantId: string
  customPrice: number
}

export async function upsertResellerCustomPrice(
  input: UpsertResellerCustomPriceInput,
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (input.customPrice < 0) {
      return { success: false, message: 'ราคาส่งต้องไม่ติดลบ' }
    }

    const result = await prisma.resellerCustomPrice.upsert({
      where: {
        agreementId_variantId: {
          agreementId: input.agreementId,
          variantId: input.variantId,
        },
      },
      update: {
        specialPrice: new Prisma.Decimal(input.customPrice),
        discountAmount: new Prisma.Decimal(0),
      },
      create: {
        agreementId: input.agreementId,
        variantId: input.variantId,
        specialPrice: new Prisma.Decimal(input.customPrice),
        discountAmount: new Prisma.Decimal(0),
      },
    })

    return {
      success: true,
      message: 'บันทึกราคาส่งเฉพาะรายการเรียบร้อยแล้ว',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการบันทึกราคาส่ง',
    }
  }
}
