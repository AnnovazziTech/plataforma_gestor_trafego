// API Route: Stripe Billing Portal
// POST - Criar sessão do portal de billing

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import stripe from '@/lib/stripe'
import { withAuth } from '@/lib/api/middleware'

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
    })

    if (!org || !org.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada. Assine um pacote primeiro.' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${appUrl}/planos`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Erro ao abrir portal de billing' }, { status: 500 })
  }
}, {
  requiredPermissions: ['canManageBilling'],
})
