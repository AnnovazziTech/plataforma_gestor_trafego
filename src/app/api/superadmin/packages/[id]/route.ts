// API Route: Superadmin - Pacote individual
// PATCH - Atualizar pacote + sync Stripe (price rotation)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'
import stripe from '@/lib/stripe/index'

const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priceMonthly: z.number().min(0).optional(),
  currency: z.string().optional(),
  modulesSlugs: z.array(z.string()).optional(),
  isBundle: z.boolean().optional(),
  isFree: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export const PATCH = withSuperAdmin(async (req: NextRequest) => {
  try {
    const id = req.url.split('/packages/')[1]?.split('?')[0]
    if (!id) {
      return NextResponse.json({ error: 'ID nao fornecido' }, { status: 400 })
    }

    const body = await req.json()
    const data = updatePackageSchema.parse(body)

    const existing = await prisma.package.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Pacote nao encontrado' }, { status: 404 })
    }

    // Determinar se o preco mudou
    const priceChanged = data.priceMonthly !== undefined && data.priceMonthly !== existing.priceMonthly
    const isFree = data.isFree ?? existing.isFree
    const newPrice = data.priceMonthly ?? existing.priceMonthly
    const currency = data.currency ?? existing.currency

    let stripePriceId = existing.stripePriceId
    let stripeProductId = existing.stripeProductId

    // Sync com Stripe se preco mudou e pacote nao e free
    if (priceChanged && !isFree && newPrice > 0) {
      // 1. Garantir que stripeProductId existe
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: data.name ?? existing.name,
          metadata: { packageSlug: existing.slug },
        })
        stripeProductId = product.id
      } else if (data.name && data.name !== existing.name) {
        // Atualizar nome do produto no Stripe
        await stripe.products.update(stripeProductId, { name: data.name })
      }

      // 2. Criar novo price
      const newStripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(newPrice * 100),
        currency: currency.toLowerCase(),
        recurring: { interval: 'month' },
        metadata: { packageSlug: existing.slug },
      })

      // 3. Arquivar price antigo
      if (existing.stripePriceId) {
        await stripe.prices.update(existing.stripePriceId, { active: false })
      }

      // 4. Atualizar referencia
      stripePriceId = newStripePrice.id
    } else if (!priceChanged && data.name && data.name !== existing.name && stripeProductId) {
      // Apenas nome mudou, atualizar no Stripe
      await stripe.products.update(stripeProductId, { name: data.name })
    }

    // Se marcou como free, limpar Stripe IDs nao faz sentido - manter para historico
    // Mas se mudou para free com preco 0, arquivar o price antigo
    if (isFree && !existing.isFree && existing.stripePriceId) {
      await stripe.prices.update(existing.stripePriceId, { active: false })
      stripePriceId = null
    }

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...data,
        stripePriceId,
        stripeProductId,
      },
    })

    return NextResponse.json({
      package: pkg,
      stripeSync: priceChanged && !isFree && newPrice > 0
        ? { synced: true, newPriceId: stripePriceId, oldPriceArchived: existing.stripePriceId }
        : { synced: false },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro ao atualizar pacote:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pacote' }, { status: 500 })
  }
})
