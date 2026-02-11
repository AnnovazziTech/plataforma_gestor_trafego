// API Route: Superadmin - Assinaturas/Pacotes
// GET - Listar todas as assinaturas com filtros por status

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

export const GET = withSuperAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const packageSlug = searchParams.get('package') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}

    // Filtrar por status (ACTIVE, PAST_DUE, CANCELED, etc)
    if (status) {
      where.status = status
    }

    // Filtrar por pacote
    if (packageSlug) {
      where.package = { slug: packageSlug }
    }

    // Excluir pacotes gratuitos por padrao (a menos que explicitamente pedido)
    if (!searchParams.get('includeFree')) {
      where.package = { ...where.package, isFree: false }
    }

    const [subscriptions, total, stats] = await Promise.all([
      prisma.organizationPackage.findMany({
        where,
        select: {
          id: true,
          status: true,
          stripeSubscriptionId: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          createdAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              stripeCustomerId: true,
            },
          },
          package: {
            select: {
              name: true,
              slug: true,
              priceMonthly: true,
              isFree: true,
              isBundle: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.organizationPackage.count({ where }),
      // Estatisticas agregadas
      Promise.all([
        prisma.organizationPackage.count({ where: { status: 'ACTIVE', package: { isFree: false } } }),
        prisma.organizationPackage.count({ where: { status: 'PAST_DUE' } }),
        prisma.organizationPackage.count({ where: { status: 'CANCELED', package: { isFree: false } } }),
        prisma.organizationPackage.count({ where: { status: 'TRIALING' } }),
        prisma.organizationPackage.count({ where: { status: 'UNPAID' } }),
      ]),
    ])

    // Calcular MRR (Monthly Recurring Revenue) dos ativos
    const activeSubscriptions = await prisma.organizationPackage.findMany({
      where: { status: 'ACTIVE', package: { isFree: false } },
      select: { package: { select: { priceMonthly: true } } },
    })
    const mrr = activeSubscriptions.reduce((sum, s) => sum + s.package.priceMonthly, 0)

    return NextResponse.json({
      subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        active: stats[0],
        pastDue: stats[1],
        canceled: stats[2],
        trialing: stats[3],
        unpaid: stats[4],
        mrr,
      },
    })
  } catch (error) {
    console.error('Superadmin subscriptions error:', error)
    return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 })
  }
})
