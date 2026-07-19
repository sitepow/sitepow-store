'use server'

import { SLIP_CREDIT_COST } from '@/constants/ai'
import { SLIP2GO_API } from '@/constants/slip'
import { OrderStatus, TransactionType } from '@/generated/prisma/enums'
import axios from 'axios'

import { prisma } from '@/lib/prisma'

export async function verifySlip(
  orderId: string,
  slipImageUrl: string,
  storeId: string,
  customerId: string,
) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) {
    return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })
  if (!customer) {
    return { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
  }

  if (customer.isBlocked) {
    if (customer.blockedUntil && new Date() > customer.blockedUntil) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { isBlocked: false, blockedUntil: null, fakeSlipCount: 0 },
      })
    } else {
      return {
        success: false,
        message: 'บัญชีของคุณถูกระงับการสั่งซื้อเนื่องจากพบความผิดปกติ',
      }
    }
  }

  const cost = SLIP_CREDIT_COST[store.plan]
  if (store.balance.toNumber() < cost) {
    return { success: false, message: 'ยอดเครดิตร้านค้าไม่เพียงพอ' }
  }

  let result
  try {
    const response = await axios.post(
      SLIP2GO_API,
      {
        payload: {
          imageUrl: slipImageUrl,
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: 'สลิปไม่ถูกต้อง หรือตรวจสอบไม่ได้',
      }
    }
    return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }
  }

  const isSlipValid = result.code === '200000'

  await prisma.$transaction(async (tx) => {
    await tx.slipVerificationHistory.create({
      data: {
        customerId,
        orderId,
        imageUrl: slipImageUrl,
        isValid: isSlipValid,
        message:
          result.message || (isSlipValid ? 'สลิปถูกต้อง' : 'สลิปไม่ถูกต้อง'),
      },
    })

    if (!isSlipValid) {
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: { fakeSlipCount: { increment: 1 } },
      })

      if (updatedCustomer.fakeSlipCount >= 5) {
        await tx.customer.update({
          where: { id: customerId },
          data: { isBlocked: true, blockedUntil: null },
        })
        await tx.activityLog.create({
          data: {
            action: 'BLOCK_CUSTOMER',
            actorType: 'SYSTEM',
            entity: 'CUSTOMER',
            entityId: customerId,
            details: { message: 'ระบบบล็อกถาวรเนื่องจากพบสลิปปลอมครบ 5 ครั้ง' },
          },
        })
      } else if (updatedCustomer.fakeSlipCount >= 3) {
        const blockDate = new Date()
        blockDate.setDate(blockDate.getDate() + 7)
        await tx.customer.update({
          where: { id: customerId },
          data: { isBlocked: true, blockedUntil: blockDate },
        })
        await tx.activityLog.create({
          data: {
            action: 'BLOCK_CUSTOMER',
            actorType: 'SYSTEM',
            entity: 'CUSTOMER',
            entityId: customerId,
            details: {
              message: `ระบบบล็อกชั่วคราว 7 วัน (ครบ ${updatedCustomer.fakeSlipCount} ครั้ง)`,
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

  return {
    success: isSlipValid,
    message:
      result.message || (isSlipValid ? 'ตรวจสอบสลิปสำเร็จ' : 'สลิปไม่ถูกต้อง'),
  }
}
