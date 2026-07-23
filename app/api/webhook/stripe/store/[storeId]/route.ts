import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { OrderStatus } from '@/generated/prisma/enums'
import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'
import { getStripeInstance } from '@/lib/stripe'

interface RouteParams {
  params: Promise<{
    storeId: string
  }>
}

export async function POST(req: Request, props: RouteParams) {
  const params = await props.params
  const { storeId } = params

  const body = await req.text()
  const sig = (await headers()).get('stripe-signature') as string

  if (!storeId) {
    return NextResponse.json({ status: 400 })
  }

  try {
    const paymentSetting = await prisma.paymentSetting.findUnique({
      where: { storeId },
    })

    if (
      !paymentSetting ||
      !paymentSetting.stripeSecretKey ||
      !paymentSetting.stripeWebhookSecret
    ) {
      return NextResponse.json({ status: 400 })
    }

    const storeStripe = getStripeInstance(paymentSetting.stripeSecretKey)

    const event = storeStripe.webhooks.constructEvent(
      body,
      sig,
      paymentSetting.stripeWebhookSecret,
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const orderId = session.metadata?.orderId
      const orderIdsString = session.metadata?.orderIds

      let targetOrderIds: string[] = []
      if (orderIdsString) {
        targetOrderIds = orderIdsString.split(',').filter(Boolean)
      } else if (orderId) {
        targetOrderIds = [orderId]
      }

      if (targetOrderIds.length > 0) {
        await prisma.order.updateMany({
          where: {
            id: { in: targetOrderIds },
            status: { not: OrderStatus.PAID },
          },
          data: {
            status: OrderStatus.PAID,
            paidAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 400 })
  }
}
