'use server'

import { SLIP_CREDIT_COST } from '@/constants/ai'
import { mapBankCodeToSlip2Go } from '@/constants/bank'
import { SLIP2GO_API, SLIP_CODE, getSlipErrorMessage } from '@/constants/slip'
import {
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import {
  ActorType,
  BankAccountType,
  LogAction,
  OrderStatus,
  TransactionType,
} from '@/generated/prisma/enums'
import { SlipVerificationAction } from '@/types/slip'
import { getBlockMessage } from '@/utils/date'
import { getPathR2FromUrl } from '@/utils/image'
import axios from 'axios'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { dispatchStoreWebhook } from '@/lib/webhook'

import { r2DeleteImage } from './r2'

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
      messageTH: 'ไม่พบข้อมูลร้านค้า',
      messageEN: 'Store information not found',
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
      messageTH: 'ไม่พบข้อมูลลูกค้า',
      messageEN: 'Customer not found',
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
      messageTH: 'ไม่พบข้อมูลออเดอร์',
      messageEN: 'Order not found',
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
      messageTH: 'ร้านค้ายังไม่ได้ตั้งค่าบัญชีธนาคารสำหรับรับเงิน',
      messageEN: 'Store has not configured a receiving bank account',
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
    if (customerStore.blockedUntil && new Date() > customerStore.blockedUntil) {
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
      const blockMsg = getBlockMessage(customerStore.blockedUntil)
      return {
        success: false,
        messageTH: blockMsg,
        messageEN: blockMsg,
        message: blockMsg,
        shouldDeleteImage: true,
      }
    }
  }

  const cost = SLIP_CREDIT_COST[store.plan]
  if (store.balance.toNumber() < cost) {
    return {
      success: false,
      messageTH: 'ยอดเครดิตร้านค้าไม่เพียงพอ',
      messageEN: 'Insufficient store credit balance',
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
      messageTH:
        'อัปโหลดสลิปเรียบร้อย เราได้บันทึกสลิปนี้เพื่อให้แอดมินตรวจสอบยอดด้วยตนเอง',
      messageEN:
        'Slip uploaded successfully. We have recorded this slip for manual verification by admin.',
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
            details: { message: 'ระบบบล็อกถาวรเนื่องจากพบสลิปปลอมครบ 5 ครั้ง' },
          },
        })
      } else if (updatedCustomerStore.fakeSlipCount >= 3) {
        const blockDate = new Date()
        blockDate.setDate(blockDate.getDate() + 7)
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
              message: `ระบบบล็อกชั่วคราว 7 วัน (ครบ ${updatedCustomerStore.fakeSlipCount} ครั้ง)`,
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
    prisma.order
      .findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          items: {
            select: {
              title: true,
              variantTitle: true,
              price: true,
              quantity: true,
              customerNote: true,
            },
          },
        },
      })
      .then((orderData) => {
        if (orderData) {
          dispatchStoreWebhook(storeId, 'order.paid', {
            orderId: orderData.id,
            orderNumber: orderData.orderNumber,
            status: 'PAID',
            paidAt: new Date().toISOString(),
            totalAmount: Number(orderData.totalAmount),
            currency: 'THB',
            paymentMethod: 'PROMPTPAY',
            items: orderData.items.map((item) => ({
              title: item.title,
              variantTitle: item.variantTitle,
              price: Number(item.price),
              quantity: item.quantity,
              customerNote: item.customerNote,
            })),
          }).catch((err) => console.error(err))
        }
      })
      .catch((err) => console.error(err))
  }

  const responseMsgTH = isSlipValid
    ? 'ตรวจสอบสลิปสำเร็จ'
    : getSlipErrorMessage(result.code, result.message)
  const responseMsgEN = isSlipValid
    ? 'Slip verified successfully'
    : result.message || getSlipErrorMessage(result.code, result.message)

  return {
    success: isSlipValid,
    shouldDeleteImage: !isSlipValid,
    messageTH: responseMsgTH,
    messageEN: responseMsgEN,
    message: responseMsgTH,
  }
}

export async function approveSlipManual(
  orderId: string,
  action: SlipVerificationAction,
) {
  try {
    if (!orderId) {
      return {
        success: false,
        messageTH: 'ไม่พบรหัสออเดอร์',
        messageEN: 'Order ID not found',
        message: 'ไม่พบรหัสออเดอร์',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
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
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลออเดอร์',
        messageEN: 'Order not found',
        message: 'ไม่พบข้อมูลออเดอร์',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: order.storeId,
      permission: 'canUpdateOrders',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
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

    await createLog({
      action: LogAction.UPDATE_ORDER_STATUS,
      actorType: ActorType.MERCHANT,
      storeId: order.storeId,
      entity: 'Order',
      entityId: orderId,
      details: {
        orderNumber: order.orderNumber,
        action: logActionText,
      },
    })

    if (action === SlipVerificationAction.APPROVE) {
      prisma.order
        .findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            items: {
              select: {
                title: true,
                variantTitle: true,
                price: true,
                quantity: true,
                customerNote: true,
              },
            },
          },
        })
        .then((orderData) => {
          if (orderData) {
            dispatchStoreWebhook(order.storeId, 'order.paid', {
              orderId: orderData.id,
              orderNumber: orderData.orderNumber,
              status: 'PAID',
              paidAt: new Date().toISOString(),
              totalAmount: Number(orderData.totalAmount),
              currency: 'THB',
              paymentMethod: 'MANUAL_SLIP',
              items: orderData.items.map((item) => ({
                title: item.title,
                variantTitle: item.variantTitle,
                price: Number(item.price),
                quantity: item.quantity,
                customerNote: item.customerNote,
              })),
            }).catch((err) => console.error(err))
          }
        })
        .catch((err) => console.error(err))
    }

    const approveMsgTH =
      action === SlipVerificationAction.APPROVE
        ? 'อนุมัติสลิปสำเร็จ'
        : 'ปฏิเสธและลบรูปสลิป รีเซ็ตออเดอร์สำเร็จ'
    const approveMsgEN =
      action === SlipVerificationAction.APPROVE
        ? 'Slip approved successfully'
        : 'Slip rejected and order reset successfully'

    return {
      success: true,
      messageTH: approveMsgTH,
      messageEN: approveMsgEN,
      message: approveMsgTH,
      data: updatedOrder,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}
