// Stripe Client Singleton
import Stripe from 'stripe'

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined
}

function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY nao configurado')
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
  })
}

export const stripe = globalForStripe.stripe ?? createStripeClient()

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe
}

export default stripe
