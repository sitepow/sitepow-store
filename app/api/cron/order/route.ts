import { NextResponse } from 'next/server'

import { MINUTE, ORDER_EXPIRY_MINUTES } from '@/constants/system'
import { ActorType, OrderStatus } from '@/generated/prisma/enums'

import { cancelOrderCore } from '@/lib/order'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const now = new Date()

  try {
    const expirationThreshold = new Date(
      now.getTime() - ORDER_EXPIRY_MINUTES * MINUTE,
    )

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: { lt: expirationThreshold },
      },
      select: { id: true },
    })

    let processedCount = 0

    for (const order of expiredOrders) {
      await cancelOrderCore({
        orderId: order.id,
        actorType: ActorType.SYSTEM,
        skipAuthCheck: true,
      })
      processedCount++
    }

    return NextResponse.json({
      success: true,
      processedExpiredOrders: processedCount,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
