import { NextResponse } from 'next/server'

import { cancelOrder } from '@/actions/order'
import {
  MILLISECONDS_PER_MINUTE,
  ORDER_EXPIRY_MINUTES,
} from '@/constants/system'
import { OrderStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const now = new Date()

  try {
    const expirationThreshold = new Date(
      now.getTime() - ORDER_EXPIRY_MINUTES * MILLISECONDS_PER_MINUTE,
    )

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: { lt: expirationThreshold },
      },
      select: { id: true, storeId: true },
    })

    let processedCount = 0

    for (const order of expiredOrders) {
      const result = await cancelOrder(order.id)
      if (result.success) {
        processedCount++
      }
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
