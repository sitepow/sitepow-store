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
import { prisma } from '@/lib/prisma'

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

        const customPrice = agreement.customPrices.find(
          (cp) => cp.variantId === item.variantId,
        )
        let finalPrice = stock.variant.price

        if (customPrice?.specialPrice) {
          finalPrice = customPrice.specialPrice
        } else if (customPrice?.discountType === DiscountType.FIXED) {
          finalPrice = stock.variant.price.sub(customPrice.discountAmount)
        } else if (customPrice?.discountType === DiscountType.PERCENTAGE) {
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
          price: finalPrice,
          costPrice: stock.variant.costPrice,
        })

        await tx.resellerStock.update({
          where: {
            agreementId_variantId: {
              agreementId: input.agreementId,
              variantId: item.variantId,
            },
          },
          data: {
            soldQuantity: { increment: item.quantity },
          },
        })
      }

      const order = await tx.order.create({
        data: {
          storeId: input.supplierStoreId,
          orderNumber: `RS-POS-${Date.now()}`,
          totalAmount: orderTotal,
          totalAmountBase: orderTotal,
          status: OrderStatus.PAID,
          resellerAgreementId: input.agreementId,
          items: {
            create: orderItemsData,
          },
        },
      })

      return order
    })

    return {
      success: true,
      message: 'ทำรายการขายสต็อกฝากขายสำเร็จ',
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

      return {
        ...stock,
        customPrice,
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

    const agreement = await prisma.resellerAgreement.findUnique({
      where: { id: agreementId },
      include: { customPrices: true },
    })

    if (!agreement) {
      return { success: false, message: 'ไม่พบข้อมูลสัญญา' }
    }

    const orders = await prisma.order.findMany({
      where: {
        resellerAgreementId: agreementId,
        status: OrderStatus.PAID,
      },
      include: { items: true },
    })

    let totalGrossSales = new Prisma.Decimal(0)
    let totalCommission = new Prisma.Decimal(0)
    let totalMerchantDue = new Prisma.Decimal(0)

    for (const order of orders) {
      for (const item of order.items) {
        const itemGross = item.price.mul(item.quantity)
        totalGrossSales = totalGrossSales.add(itemGross)

        const customPrice = agreement.customPrices.find(
          (cp) => cp.variantId === item.variantId,
        )
        let commission = new Prisma.Decimal(0)

        if (customPrice) {
          if (customPrice.specialPrice) {
            const unitCommission = item.price.sub(customPrice.specialPrice)
            commission = unitCommission.mul(item.quantity)
          } else if (customPrice.discountAmount) {
            if (customPrice.discountType === DiscountType.PERCENTAGE) {
              commission = itemGross.mul(customPrice.discountAmount).div(100)
            } else if (customPrice.discountType === DiscountType.FIXED) {
              commission = customPrice.discountAmount.mul(item.quantity)
            }
          }
        } else if (
          agreement.defaultDiscountType === DiscountType.PERCENTAGE &&
          agreement.defaultDiscountAmount
        ) {
          commission = itemGross.mul(agreement.defaultDiscountAmount).div(100)
        }

        if (commission.lessThan(0)) commission = new Prisma.Decimal(0)

        const merchantDue = itemGross.sub(commission)

        totalCommission = totalCommission.add(commission)
        totalMerchantDue = totalMerchantDue.add(merchantDue)
      }
    }

    const paidPayouts = await prisma.resellerPayout.aggregate({
      where: {
        agreementId,
        status: PayoutStatus.PAID,
      },
      _sum: { amount: true },
    })

    const totalPaidAmount = paidPayouts._sum.amount || new Prisma.Decimal(0)
    const pendingPayoutAmount = totalMerchantDue.sub(totalPaidAmount)

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
          : 'เกิดข้อผิดพลาดในการคำนวณยอดสรุป',
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
            data.resellerType === ResellerType.EXTERNAL
              ? data.resellerCustomerId
              : null,
          defaultDiscountAmount: data.commissionRate,
          defaultDiscountType: DiscountType.PERCENTAGE,
          status: AgreementStatus.ACTIVE,
        },
      })

      let targetUserId: string | null = null

      if (data.resellerType === ResellerType.EXTERNAL) {
        targetUserId = data.resellerCustomerId || null
      } else if (
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
        const user = await tx.user.findUnique({
          where: { id: targetUserId },
          include: { employee: true },
        })

        if (user) {
          let employeeId = user.employee?.id
          if (!employeeId) {
            const newEmployee = await tx.employee.create({
              data: {
                userId: user.id,
                name: user.name || user.email || 'Reseller Partner',
                email: user.email || `reseller_${user.id}@system.local`,
              },
            })
            employeeId = newEmployee.id
          }

          const employeeStore = await tx.employeeStore.upsert({
            where: {
              storeId_employeeId: {
                storeId: data.supplierStoreId,
                employeeId: employeeId,
              },
            },
            update: {},
            create: {
              storeId: data.supplierStoreId,
              employeeId: employeeId,
            },
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

          if (targetBranchId && resellerRole) {
            await tx.employeeBranch.upsert({
              where: {
                employeeStoreId_branchId: {
                  employeeStoreId: employeeStore.id,
                  branchId: targetBranchId,
                },
              },
              update: {
                roleId: resellerRole.id,
              },
              create: {
                employeeStoreId: employeeStore.id,
                branchId: targetBranchId,
                roleId: resellerRole.id,
              },
            })
          }
        }
      }

      return agreement
    })

    return {
      success: true,
      message: 'สร้างสัญญาและเปิดสิทธิ์พนักงาน POS เรียบร้อยแล้ว',
      data: serializeDecimal(result),
    }
  } catch (error: unknown) {
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
  targetBranchId?: string
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

    const result = await prisma.$transaction(async (tx) => {
      const resellerStock = await tx.resellerStock.findUnique({
        where: {
          agreementId_variantId: {
            agreementId: input.agreementId,
            variantId: input.variantId,
          },
        },
        include: {
          agreement: {
            select: { supplierStoreId: true },
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

      const mainStock = await tx.productStock.findFirst({
        where: {
          variantId: input.variantId,
          branch: input.targetBranchId
            ? { id: input.targetBranchId }
            : {
                storeId: resellerStock.agreement.supplierStoreId,
                isMain: true,
              },
        },
      })

      if (mainStock) {
        await tx.productStock.update({
          where: { id: mainStock.id },
          data: {
            quantity: { increment: input.quantity },
          },
        })
      }

      return updatedResellerStock
    })

    return {
      success: true,
      message: 'รับคืนสต็อกเข้าคลังหลักเรียบร้อยแล้ว',
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
