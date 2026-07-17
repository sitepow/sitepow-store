import { NextResponse } from 'next/server'

import { ActorType, LogAction, OrderStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const payload = await req.json()

  const order = await prisma.order.findUnique({
    where: { orderNumber: payload.order_number },
  })

  if (!order) {
    return NextResponse.json({ error: 'ไม่พบออเดอร์นี้' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        action: LogAction.UPDATE_ORDER_STATUS,
        actorType: ActorType.SYSTEM,
        storeId: order.storeId,
        entity: 'ORDER',
        entityId: order.id,
        details: payload,
      },
    })

    if (payload.status === 'success') {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          transactionId: payload.tx_id,
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}
