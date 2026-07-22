'use server'

import { CheckoutParams, PaymentMethod } from '@/types/checkout'

import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(params: CheckoutParams) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: [PaymentMethod.CARD, PaymentMethod.PROMPTPAY],
    customer_email: params.customerEmail!,
    line_items: [
      {
        price_data: {
          currency: 'thb',
          product_data: {
            name: params.description,
          },
          unit_amount: params.amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      ...params.metadata,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  if (!session?.url) {
    return {
      success: false,
    }
  }

  return { success: true, url: session.url }
}
