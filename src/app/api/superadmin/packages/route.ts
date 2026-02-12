// API Route: Superadmin - Pacotes
// GET - Listar pacotes com contagem de assinantes | POST - Criar pacote + Stripe

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'
import stripe from '@/lib/stripe/index'

export const GET = withSuperAdmin(async () => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { organizationPackages: true } },
      },
    })

    // Contar apenas assinantes ativos por pacote
    const activeCountsRaw = await prisma.organizationPackage.groupBy({
      by: ['packageId'],
      where: { status: 'ACTIVE' },
      _count: true,
    })
    const activeCounts = new Map(activeCountsRaw.map(c => [c.packageId, c._count]))

    return NextResponse.json({
      packages: packages.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceMonthly: p.priceMonthly,
        currency: p.currency,
        stripePriceId: p.stripePriceId,
        stripeProductId: p.stripeProductId,
        modulesSlugs: p.modulesSlugs,
        isBundle: p.isBundle,
        isFree: p.isFree,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        subscriberCount: p._count.organizationPackages,
        activeSubscriberCount: activeCounts.get(p.id) || 0,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error)
    return NextResponse.json({ error: 'Erro ao buscar pacotes' }, { status: 500 })
  }
})

const createPackageSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minusculas, numeros e hifens'),
  description: z.string().optional(),
  priceMonthly: z.number().min(0),
  currency: z.string().default('BRL'),
  modulesSlugs: z.array(z.string()).default([]),
  isBundle: z.boolean().default(false),
  isFree: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const POST = withSuperAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createPackageSchema.parse(body)

    // Verificar slug duplicado
    const existing = await prisma.package.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug ja existe' }, { status: 409 })
    }

    let stripeProductId: string | null = null
    let stripePriceId: string | null = null

    // Se nao e free, criar produto e price no Stripe
    if (!data.isFree && data.priceMonthly > 0) {
      const product = await stripe.products.create({
        name: data.name,
        metadata: { packageSlug: data.slug },
      })
      stripeProductId = product.id

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(data.priceMonthly * 100),
        currency: data.currency.toLowerCase(),
        recurring: { interval: 'month' },
        metadata: { packageSlug: data.slug },
      })
      stripePriceId = price.id
    }

    const pkg = await prisma.package.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceMonthly: data.priceMonthly,
        currency: data.currency,
        stripePriceId,
        stripeProductId,
        modulesSlugs: data.modulesSlugs,
        isBundle: data.isBundle,
        isFree: data.isFree,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro ao criar pacote:', error)
    return NextResponse.json({ error: 'Erro ao criar pacote' }, { status: 500 })
  }
})
