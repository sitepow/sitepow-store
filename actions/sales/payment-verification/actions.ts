'use server'

import { r2DeleteImage } from '@/actions/shared/r2/actions'
import { SLIP_CREDIT_COST } from '@/constants/ai/config'
import { mapBankCodeToSlip2Go } from '@/constants/payment/bank'
import {
  SLIP2GO_API,
  SLIP_CODE,
  getSlipErrorMessage,
} from '@/constants/payment/slip'
import { DAY, FAKE_SLIP_BLOCK_DAYS } from '@/constants/system'
import {
  ActorType,
  BankAccountType,
  LogAction,
  OrderStatus,
  TransactionType,
} from '@/generated/prisma/enums'
import { SlipVerificationAction } from '@/types/sales'
import { fromNow, getBlockMessage, isPast } from '@/utils/formatting/date'
import { getPathR2FromUrl } from '@/utils/media/image'
import axios from 'axios'

import { createLog } from '@/lib/activity/log'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { dispatchOrderWebhook } from '@/lib/webhook/dispatcher'

export async function verifySlip(
  orderId: string,
  slipImageUrl: string,
  storeId: string,
  customerId: string,
) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })

  if (!store) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลร้านค้า',
      shouldDeleteImage: false,
    }
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })

  if (!customer) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลลูกค้า',
      shouldDeleteImage: false,
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { totalAmount: true },
  })

  if (!order) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลออเดอร์',
      shouldDeleteImage: false,
    }
  }

  const paymentSetting = await prisma.paymentSetting.findUnique({
    where: { storeId },
    include: { bankAccounts: true },
  })

  if (!paymentSetting || !paymentSetting.bankAccounts.length) {
    return {
      success: false,
      message: 'ร้านค้ายังไม่ได้ตั้งค่าบัญชีธนาคารสำหรับรับเงิน',
      shouldDeleteImage: false,
    }
  }

  let customerStore = await prisma.customerStore.findUnique({
    where: {
      customerId_storeId: {
        customerId,
        storeId,
      },
    },
  })

  if (!customerStore) {
    customerStore = await prisma.customerStore.create({
      data: {
        customerId,
        storeId,
      },
    })
  }

  if (customerStore.isBlocked) {
    if (customerStore.blockedUntil && isPast(customerStore.blockedUntil)) {
      await prisma.customerStore.update({
        where: {
          customerId_storeId: {
            customerId,
            storeId,
          },
        },
        data: { isBlocked: false, blockedUntil: null, fakeSlipCount: 0 },
      })
    } else {
      return {
        success: false,
        message: getBlockMessage(customerStore.blockedUntil),
        shouldDeleteImage: true,
      }
    }
  }

  const cost = SLIP_CREDIT_COST[store.plan]
  if (store.balance.toNumber() < cost) {
    return {
      success: false,
      message: 'ยอดเครดิตร้านค้าไม่เพียงพอ',
      shouldDeleteImage: true,
    }
  }

  let result
  try {
    const response = await axios.post(
      SLIP2GO_API,
      {
        payload: {
          imageUrl: slipImageUrl,
          checkCondition: {
            checkDuplicate: true,
            checkReceiver: paymentSetting.bankAccounts.map((account) => ({
              accountType: mapBankCodeToSlip2Go(account.bankName, account.type),
              accountNumber:
                account.type === BankAccountType.PROMPTPAY
                  ? account.promptPayId
                  : account.accountNumber,
            })),
            checkAmount: {
              type: 'eq',
              amount: order.totalAmount.toString(),
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SLIP2GO_API_KEY}`,
        },
      },
    )

    result = response.data

    if (response.status !== 200) {
      throw new Error()
    }
  } catch {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.MANUAL_CHECK,
        paymentProof: slipImageUrl,
      },
    })

    return {
      success: true,
      requiresManualCheck: true,
      shouldDeleteImage: false,
      message:
        'อัพโหลดสลิปเรียบร้อย เราได้บันทึกสลิปนี้เพื่อให้แอดมินตรวจสอบยอดด้วยตนเอง',
    }
  }

  const isSlipValid = result.code === SLIP_CODE.VALID

  const responseMessage = isSlipValid
    ? 'ตรวจสอบสลิปสำเร็จ'
    : getSlipErrorMessage(result.code, result.message)

  await prisma.$transaction(async (tx) => {
    await tx.slipVerificationHistory.create({
      data: {
        customerId,
        orderId,
        storeId,
        imageUrl: slipImageUrl,
        isValid: isSlipValid,
        message: responseMessage,
      },
    })

    if (!isSlipValid) {
      const updatedCustomerStore = await tx.customerStore.update({
        where: {
          customerId_storeId: {
            customerId,
            storeId,
          },
        },
        data: { fakeSlipCount: { increment: 1 } },
      })

      if (updatedCustomerStore.fakeSlipCount >= 5) {
        await tx.customerStore.update({
          where: {
            customerId_storeId: {
              customerId,
              storeId,
            },
          },
          data: { isBlocked: true, blockedUntil: null },
        })
        await tx.activityLog.create({
          data: {
            action: LogAction.BLOCK_CUSTOMER,
            actorType: ActorType.SYSTEM,
            storeId,
            entity: 'CustomerStore',
            entityId: updatedCustomerStore.id,
            details: {
              summary: 'ระบบบล็อกลูกค้าถาวรเนื่องจากพบสลิปปลอมครบ 5 ครั้ง',
              message: 'ระบบบล็อกถาวรเนื่องจากพบสลิปปลอมครบ 5 ครั้ง',
              fakeSlipCount: updatedCustomerStore.fakeSlipCount,
            },
          },
        })
      } else if (updatedCustomerStore.fakeSlipCount >= 3) {
        const blockDate = fromNow(FAKE_SLIP_BLOCK_DAYS * DAY)
        await tx.customerStore.update({
          where: {
            customerId_storeId: {
              customerId,
              storeId,
            },
          },
          data: { isBlocked: true, blockedUntil: blockDate },
        })
        await tx.activityLog.create({
          data: {
            action: LogAction.BLOCK_CUSTOMER,
            actorType: ActorType.SYSTEM,
            storeId,
            entity: 'CustomerStore',
            entityId: updatedCustomerStore.id,
            details: {
              summary: `ระบบบล็อกลูกค้าชั่วคราว 7 วัน (พบสลิปปลอมครั้งที่ ${updatedCustomerStore.fakeSlipCount})`,
              message: `ระบบบล็อกชั่วคราว 7 วัน (ครบ ${updatedCustomerStore.fakeSlipCount} ครั้ง)`,
              fakeSlipCount: updatedCustomerStore.fakeSlipCount,
            },
          },
        })
      }
    } else {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          paymentProof: slipImageUrl,
        },
      })
      await tx.store.update({
        where: { id: storeId },
        data: { balance: { decrement: cost } },
      })
      await tx.transaction.create({
        data: {
          storeId,
          amount: cost,
          type: TransactionType.SLIP_VERIFY,
          description: `ตรวจสอบสลิปสำหรับออเดอร์ ${orderId}`,
          orderId,
        },
      })
    }
  })

  if (isSlipValid) {
    dispatchOrderWebhook({
      storeId,
      event: 'order.paid',
      orderId,
    }).catch((err) => console.error('Webhook dispatch error:', err))
  }

  return {
    success: isSlipValid,
    shouldDeleteImage: !isSlipValid,
    message: responseMessage,
  }
}

export async function approveSlipManual(
  orderId: string,
  action: SlipVerificationAction,
) {
  try {
    if (!orderId) {
      return { success: false, message: 'ไม่พบรหัสออเดอร์' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        storeId: true,
        orderNumber: true,
        status: true,
        paymentProof: true,
      },
    })

    if (!order) {
      return { success: false, message: 'ไม่พบข้อมูลออเดอร์' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: order.storeId,
      permission: 'canUpdateOrders',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    let updatedData = {}
    let logActionText = ''

    if (action === SlipVerificationAction.APPROVE) {
      updatedData = { status: OrderStatus.PAID, paidAt: new Date() }
      logActionText = 'approve_slip_manual'
    } else {
      if (order.paymentProof) {
        try {
          const oldKey = getPathR2FromUrl(order.paymentProof)

          if (oldKey) {
            await r2DeleteImage(oldKey)
          }
        } catch (deleteError) {
          console.error(deleteError)
        }
      }

      updatedData = {
        paymentProof: null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
      }
      logActionText = 'reject_slip_manual'
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updatedData,
    })

    const actionSummary =
      action === SlipVerificationAction.APPROVE
        ? 'อนุมัติสลิปและยืนยันการชำระเงิน'
        : 'ปฏิเสธสลิปและรีเซ็ตคำสั่งซื้อ'

    await createLog({
      action: LogAction.UPDATE_ORDER_STATUS,
      actorType: ActorType.MERCHANT,
      storeId: order.storeId,
      entity: 'Order',
      entityId: orderId,
      details: {
        summary: `ตรวจสอบสลิปคำสั่งซื้อ #${order.orderNumber}: ${actionSummary}`,
        orderNumber: order.orderNumber,
        action: logActionText,
      },
    })

    if (action === SlipVerificationAction.APPROVE) {
      dispatchOrderWebhook({
        storeId: order.storeId,
        event: 'order.paid',
        orderId,
      }).catch((err) => console.error('Webhook dispatch error:', err))
    }

    return {
      success: true,
      message:
        action === SlipVerificationAction.APPROVE
          ? 'อนุมัติสลิปสำเร็จ'
          : 'ปฏิเสธและลบรูปสลิป รีเซ็ตออเดอร์สำเร็จ',
      data: updatedOrder,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
