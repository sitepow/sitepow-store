import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { purchaseCredit } from '@/actions/billing/credit/actions'
import { invalidateStoreCache } from '@/actions/store/management/invalidation'
import { Prisma } from '@/generated/prisma/client'
import {
  InvoiceStatus,
  Plan,
  StoreStatus,
  SubStatus,
} from '@/generated/prisma/enums'
import { CheckoutParams, CheckoutType } from '@/types/checkout'
import { addMonths } from 'date-fns'
import Stripe from 'stripe'

import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/integrations/stripe'

async function clearStoreCache(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { slug: true },
  })

  if (store?.slug) {
    await invalidateStoreCache(store?.slug)
  }
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch {
    return NextResponse.json({ status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const metadata = session.metadata as CheckoutParams['metadata']

    const { type, relatedId, storeId, newPlan, billingCycle } = metadata

    if (
      !type ||
      (type === CheckoutType.SUBSCRIPTION && (!relatedId || !storeId))
    ) {
      return NextResponse.json({ status: 400 })
    }

    try {
      if (type === CheckoutType.UPGRADE && storeId && newPlan) {
        const months = parseInt(billingCycle || '1')
        const targetPlan = newPlan as Plan

        await prisma.$transaction([
          prisma.subscription.update({
            where: { storeId },
            data: {
              plan: targetPlan,
              status: SubStatus.ACTIVE,
              endDate: addMonths(new Date(), months),
              pendingPlan: null,
            },
          }),
          prisma.store.update({
            where: { id: storeId },
            data: { plan: targetPlan },
          }),
          prisma.subscriptionInvoice.create({
            data: {
              storeId,
              plan: targetPlan,
              amount: new Prisma.Decimal(session.amount_total! / 100),
              status: InvoiceStatus.PAID,
              periodStart: new Date(),
              periodEnd: addMonths(new Date(), months),
              description: `ชำระส่วนต่าง Upgrade เป็นแพลน ${targetPlan}`,
            },
          }),
        ])

        await clearStoreCache(storeId)
      }
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
          prisma.store.update({
            where: { id: storeId },
            data: { status: StoreStatus.ACTIVE },
          }),
        ])

        await clearStoreCache(storeId)
      } else if (type === CheckoutType.CREDIT && storeId) {
        const amountInBaht = session.amount_total! / 100

        const result = await purchaseCredit({
          storeId,
          userId: relatedId,
          amount: amountInBaht,
        })

        if (!result.success) {
          console.error(result.message)
          return NextResponse.json({ status: 500 })
        }

        await clearStoreCache(storeId)
      }
    } catch (error) {
      console.error(error)
      return NextResponse.json({ status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
