import Stripe from 'stripe'

export const getStripeInstance = (secretKey?: string) => {
  const apiKey = secretKey || process.env.STRIPE_SECRET_KEY

  if (!apiKey) {
    throw new Error('Missing Stripe Secret Key')
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })
}

const globalForStripe = global as unknown as { stripe: Stripe }

export const stripe =
  globalForStripe.stripe ||
  new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })

if (process.env.NODE_ENV !== 'production' && process.env.STRIPE_SECRET_KEY) {
  globalForStripe.stripe = stripe
}
