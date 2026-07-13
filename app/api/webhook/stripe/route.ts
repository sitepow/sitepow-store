import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { purchaseCredit } from '@/actions/credit'
import { InvoiceStatus, SubStatus } from '@/generated/prisma/enums'
import { CheckoutType } from '@/types/checkout'
import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const metadata = session.metadata as {
      type?: CheckoutType
      relatedId?: string
      storeId?: string
    }

    const { type, relatedId, storeId } = metadata

    if (
      !type ||
      !relatedId ||
      (type === CheckoutType.SUBSCRIPTION && !storeId)
    ) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      if (type === CheckoutType.SUBSCRIPTION && storeId) {
        await prisma.$transaction([
          prisma.subscriptionInvoice.update({
            where: { id: relatedId },
            data: {
              status: InvoiceStatus.PAID,
              paidAt: new Date(),
            },
          }),
          prisma.subscription.update({
            where: { storeId: storeId },
            data: { status: SubStatus.ACTIVE },
          }),
        ])
      } else if (type === CheckoutType.CREDIT && storeId) {
        const amountInBaht = session.amount_total! / 100

        const result = await purchaseCredit({
          storeId,
          amount: amountInBaht,
          description: `เติมเครดิต (Invoice: ${relatedId})`,
        })

        if (!result.success) {
          console.error('Credit purchase failed:', result.message)
          return NextResponse.json(
            { error: 'Credit purchase failed' },
            { status: 500 },
          )
        }
      }
    } catch (error) {
      console.error('Database update failed:', error)
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ received: true })
}
