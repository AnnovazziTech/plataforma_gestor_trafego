// API Route: Subscriptions
// GET - Listar pacotes ativos da organização

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  try {
    const subscriptions = await prisma.organizationPackage.findMany({
      where: {
        organizationId: ctx.organizationId,
      },
      include: {
        package: true,
      },
      orderBy: {
        package: { sortOrder: 'asc' },
      },
    })

    return NextResponse.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        packageId: sub.packageId,
        packageName: sub.package.name,
        packageSlug: sub.package.slug,
        priceMonthly: sub.package.priceMonthly,
        currency: sub.package.currency,
        status: sub.status,
        isFree: sub.package.isFree,
        isBundle: sub.package.isBundle,
        modulesSlugs: sub.package.modulesSlugs,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        createdAt: sub.createdAt,
      })),
    })
  } catch (error) {
    console.error('Subscriptions error:', error)
    return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 })
  }
})
