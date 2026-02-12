// Stripe Client Singleton (lazy — safe during Next.js build phase)
import Stripe from 'stripe'

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined
}

function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY nao configurado')
    }
    globalForStripe.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return globalForStripe.stripe
}

// Proxy that defers instantiation to first method access (build-safe)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const real = getStripe()
    const value = (real as any)[prop]
    if (typeof value === 'function') {
      return value.bind(real)
    }
    return value
  },
})

export default stripe
