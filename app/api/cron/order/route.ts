import { NextResponse } from 'next/server'

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

    if (expiredOrders.length > 0) {
      await prisma.order.updateMany({
        where: {
          id: { in: expiredOrders.map((order) => order.id) },
        },
        data: {
          status: OrderStatus.CANCELLED,
        },
      })
    }

    return NextResponse.json({
      success: true,
      processedExpiredOrders: expiredOrders.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
