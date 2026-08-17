import Stripe from 'stripe'

const globalForStripe = global as unknown as { stripe: Stripe | undefined }

export const getStripeInstance = (secretKey?: string) => {
  const apiKey =
    secretKey || process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build'

  return new Stripe(apiKey, {
    apiVersion: '2026-07-29.dahlia',
    typescript: true,
  })
}

export const stripe = globalForStripe.stripe || getStripeInstance()

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe
}
