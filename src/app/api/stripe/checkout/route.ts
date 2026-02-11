// API Route: Stripe Checkout
// POST - Criar sessão de checkout para um pacote

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import stripe from '@/lib/stripe'
import { withAuth } from '@/lib/api/middleware'

const checkoutSchema = z.object({
  packageSlug: z.string().min(1),
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const body = await req.json()
    const { packageSlug } = checkoutSchema.parse(body)

    // Buscar pacote
    const pkg = await prisma.package.findUnique({
      where: { slug: packageSlug },
    })

    if (!pkg || !pkg.isActive || pkg.isFree) {
      return NextResponse.json(
        { error: 'Pacote nao encontrado ou nao disponivel para compra' },
        { status: 400 }
      )
    }

    if (!pkg.stripePriceId) {
      return NextResponse.json(
        { error: 'Pacote sem preco configurado na Stripe' },
        { status: 500 }
      )
    }

    // Verificar se já tem esse pacote ativo ou com checkout pendente
    const existingPackage = await prisma.organizationPackage.findUnique({
      where: {
        organizationId_packageId: {
          organizationId: ctx.organizationId,
          packageId: pkg.id,
        },
      },
    })

    if (existingPackage && ['ACTIVE', 'TRIALING', 'INCOMPLETE'].includes(existingPackage.status)) {
      return NextResponse.json(
        { error: 'Voce ja possui este pacote ativo ou com checkout em andamento' },
        { status: 400 }
      )
    }

    // Se pacote é bundle (completo), verificar se já tem pacotes individuais
    if (pkg.isBundle) {
      const activeIndividualPackages = await prisma.organizationPackage.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: { in: ['ACTIVE', 'TRIALING'] },
          package: { isFree: false, isBundle: false },
        },
      })
      if (activeIndividualPackages.length > 0) {
        return NextResponse.json(
          { error: 'Cancele seus pacotes individuais antes de assinar o pacote Completo' },
          { status: 400 }
        )
      }
    } else {
      // Se já tem o completo, bloquear individual
      const activeBundle = await prisma.organizationPackage.findFirst({
        where: {
          organizationId: ctx.organizationId,
          status: { in: ['ACTIVE', 'TRIALING'] },
          package: { isBundle: true },
        },
      })
      if (activeBundle) {
        return NextResponse.json(
          { error: 'Voce ja possui o pacote Completo que inclui este modulo' },
          { status: 400 }
        )
      }
    }

    // Criar registro INCOMPLETE para prevenir race condition (lock)
    // Se o checkout nao for completado, fica como INCOMPLETE e nao bloqueia acesso
    await prisma.organizationPackage.upsert({
      where: {
        organizationId_packageId: {
          organizationId: ctx.organizationId,
          packageId: pkg.id,
        },
      },
      update: { status: 'INCOMPLETE' },
      create: {
        organizationId: ctx.organizationId,
        packageId: pkg.id,
        status: 'INCOMPLETE',
      },
    })

    // Find or create Stripe Customer
    const org = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 })
    }

    let customerId = org.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: org.name,
        metadata: {
          organizationId: org.id,
          organizationSlug: org.slug,
        },
      })
      customerId = customer.id

      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Criar sessão de checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: pkg.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        organizationId: ctx.organizationId,
        packageSlug: pkg.slug,
        packageId: pkg.id,
      },
      subscription_data: {
        metadata: {
          organizationId: ctx.organizationId,
          packageSlug: pkg.slug,
          packageId: pkg.id,
        },
      },
      success_url: `${appUrl}/planos?success=true&package=${pkg.slug}`,
      cancel_url: `${appUrl}/planos?canceled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expira em 30min
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erro ao criar sessao de checkout' }, { status: 500 })
  }
}, {
  requiredPermissions: ['canManageBilling'],
})
