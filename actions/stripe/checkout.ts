'use server'

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
        message: 'ไม่สามารถสร้างเซสชันการชำระเงินได้',
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
  params: CreateStoreCheckoutParams,
) {
  try {
    const paymentSetting = await prisma.paymentSetting.findUnique({
      where: { storeId: params.storeId },
    })

    if (!paymentSetting || !paymentSetting.stripeSecretKey) {
      return {
        success: false,
        message: 'ร้านค้านี้ยังไม่ได้ตั้งค่าระบบชำระเงิน Stripe',
      }
    }

    const storeStripe = getStripeInstance(paymentSetting.stripeSecretKey)

    const session = await storeStripe.checkout.sessions.create({
      payment_method_types: [PaymentMethod.CARD, PaymentMethod.PROMPTPAY],
      customer_email: params.customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: params.description,
            },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        orderId: params.orderId,
        storeId: params.storeId,
        ...params.metadata,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    })

    if (!session?.url) {
      return {
        success: false,
        message: 'ไม่สามารถสร้างเซสชันการชำระเงินของร้านค้าได้',
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
