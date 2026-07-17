'use server'

import { SLIP_CREDIT_COST } from '@/constants/ai'
import { SLIP2GO_API } from '@/constants/slip'
import { TransactionType } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export async function verifySlip(
  orderId: string,
  slipImageUrl: string,
  storeId: string,
) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  })

  if (!store) {
    return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
  }

  const cost = SLIP_CREDIT_COST[store.plan]

  if (store.balance.toNumber() < cost) {
    return {
      success: false,
      message: 'ยอดเครดิตในระบบไม่เพียงพอสำหรับค่าตรวจสอบสลิป',
    }
  }

  const response = await fetch(SLIP2GO_API, {
    method: 'POST',
    body: JSON.stringify({ image_url: slipImageUrl }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SLIP2GO_API_KEY}`,
    },
  })

  if (!response.ok) {
    return {
      success: false,
      message: 'การเชื่อมต่อ API ตรวจสอบสลิปขัดข้อง',
    }
  }

  const result = await response.json()

  await prisma.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data: { balance: { decrement: cost } },
    })

    await tx.transaction.create({
      data: {
        storeId: storeId,
        amount: cost,
        type: TransactionType.SLIP_VERIFY,
        description: `ตรวจสอบสลิปสำหรับออเดอร์: ${orderId}`,
        orderId: orderId,
      },
    })
  })

  return result
}
