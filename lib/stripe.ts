import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const globalForStripe = global as unknown as { stripe: Stripe }

export const stripe =
  globalForStripe.stripe ||
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe
}
