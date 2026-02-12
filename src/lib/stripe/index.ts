// Stripe Client Singleton (lazy — safe during Next.js build phase)
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

function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = createStripeClient()
  }
  return globalForStripe.stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver)
  },
})

export default stripe
