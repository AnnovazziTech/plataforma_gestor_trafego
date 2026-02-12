// API Route: Stripe Webhook
// POST - Receber eventos da Stripe

export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import stripe from '@/lib/stripe'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/api/rate-limit'
import type Stripe from 'stripe'
import { SubscriptionStatus } from '@/generated/prisma'

// Helper: extrair periodo da subscription (v20 moveu para items)
function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items?.data?.[0]
  return {
    start: item?.current_period_start
      ? new Date(item.current_period_start * 1000)
      : new Date(subscription.start_date * 1000),
    end: item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : null,
  }
}

// Helper: extrair subscriptionId do invoice (v20 moveu para parent)
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription
  if (!sub) return null
  return typeof sub === 'string' ? sub : sub.id
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req)
  const rl = checkRateLimit(`stripe-webhook:${ip}`, RATE_LIMITS.webhook)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { organizationId, packageId } = session.metadata || {}
  if (!organizationId || !packageId) return

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id

  if (!subscriptionId) return

  // Buscar detalhes da subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const period = getSubscriptionPeriod(subscription)

  await prisma.organizationPackage.upsert({
    where: {
      organizationId_packageId: {
        organizationId,
        packageId,
      },
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: false,
    },
    create: {
      organizationId,
      packageId,
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
    },
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const orgPkg = await prisma.organizationPackage.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!orgPkg) return

  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    incomplete: 'INCOMPLETE',
  }

  const newStatus = statusMap[subscription.status]
  if (!newStatus) {
    console.error(`Unknown Stripe subscription status: "${subscription.status}" for subscription ${subscription.id}`)
    return
  }

  const period = getSubscriptionPeriod(subscription)

  await prisma.organizationPackage.update({
    where: { id: orgPkg.id },
    data: {
      status: newStatus,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const orgPkg = await prisma.organizationPackage.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!orgPkg) return

  await prisma.organizationPackage.update({
    where: { id: orgPkg.id },
    data: { status: 'CANCELED' },
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)
  if (!subscriptionId) {
    console.warn(`invoice.paid: No subscription ID found for invoice ${invoice.id}`)
    return
  }

  const orgPkg = await prisma.organizationPackage.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!orgPkg) {
    console.warn(`invoice.paid: No organization package found for subscription ${subscriptionId}`)
    return
  }

  // Buscar subscription atualizada para periodo correto
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const period = getSubscriptionPeriod(subscription)

  await prisma.organizationPackage.update({
    where: { id: orgPkg.id },
    data: {
      status: 'ACTIVE',
      currentPeriodEnd: period.end,
    },
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)
  if (!subscriptionId) {
    console.warn(`invoice.payment_failed: No subscription ID found for invoice ${invoice.id}`)
    return
  }

  const orgPkg = await prisma.organizationPackage.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!orgPkg) {
    console.warn(`invoice.payment_failed: No organization package found for subscription ${subscriptionId}`)
    return
  }

  await prisma.organizationPackage.update({
    where: { id: orgPkg.id },
    data: { status: 'PAST_DUE' },
  })
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { organizationId, packageId } = session.metadata || {}
  if (!organizationId || !packageId) return

  // Limpar registro INCOMPLETE que foi criado como lock no checkout
  const orgPkg = await prisma.organizationPackage.findUnique({
    where: {
      organizationId_packageId: {
        organizationId,
        packageId,
      },
    },
  })

  if (orgPkg && orgPkg.status === 'INCOMPLETE' && !orgPkg.stripeSubscriptionId) {
    await prisma.organizationPackage.delete({
      where: { id: orgPkg.id },
    })
  }
}
