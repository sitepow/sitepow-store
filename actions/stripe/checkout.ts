'use server'

import { isZeroDecimalCurrency } from '@/constants/currencies'
import {
  CheckoutParams,
  CreateStoreCheckoutParams,
  PaymentMethod,
} from '@/types/checkout'

import { prisma } from '@/lib/prisma'
import { getStripeInstance, stripe } from '@/lib/stripe'

export async function createCheckoutSession(params: CheckoutParams) {
  try {
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
        messageTH: 'ไม่สามารถสร้างเซสชันการชำระเงินได้',
        messageEN: 'Failed to create checkout session',
      }
    }

    return { success: true, url: session.url }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}

export async function createStoreCheckoutSession(
  params: CreateStoreCheckoutParams & { orderIds?: string },
) {
  try {
    const paymentSetting = await prisma.paymentSetting.findUnique({
      where: { storeId: params.storeId },
    })

    if (!paymentSetting || !paymentSetting.stripeSecretKey) {
      return {
        success: false,
        messageTH: 'ร้านค้านี้ยังไม่ได้ตั้งค่าระบบชำระเงิน Stripe',
        messageEN: 'This store has not configured Stripe payment yet',
      }
    }

    const storeStripe = getStripeInstance(paymentSetting.stripeSecretKey)

    const currency = (params.currency || 'thb').toLowerCase()
    const isZeroDecimal = isZeroDecimalCurrency(currency)
    const unitAmount = isZeroDecimal
      ? Math.round(params.amount)
      : Math.round(params.amount * 100)

    const paymentMethodTypes =
      currency === 'thb'
        ? [PaymentMethod.CARD, PaymentMethod.PROMPTPAY]
        : [PaymentMethod.CARD]

    const session = await storeStripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      customer_email: params.customerEmail,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: params.description,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        ...(params.orderId ? { orderId: params.orderId } : {}),
        ...(params.orderIds ? { orderIds: params.orderIds } : {}),
        storeId: params.storeId,
        currency: currency.toUpperCase(),
        ...params.metadata,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    })

    if (!session?.url) {
      return {
        success: false,
        messageTH: 'ไม่สามารถสร้างเซสชันการชำระเงินของร้านค้าได้',
        messageEN: 'Failed to create store checkout session',
      }
    }

    return { success: true, url: session.url }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
