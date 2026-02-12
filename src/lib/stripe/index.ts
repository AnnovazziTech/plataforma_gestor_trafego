// Stripe Client Singleton
// Nao lanca erro no import — seguro durante build do Next.js/Vercel
import Stripe from 'stripe'

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined
}

function createStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
  })
}

if (!globalForStripe.stripe) {
  globalForStripe.stripe = createStripeClient() ?? undefined
}

export const stripe = globalForStripe.stripe as Stripe

export default stripe
