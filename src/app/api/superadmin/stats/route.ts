// API Route: Superadmin - Metricas Globais
// GET - Buscar metricas agregadas da plataforma

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

export const GET = withSuperAdmin(async (req, ctx) => {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      activeUsers,
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      totalIntegrations,
      planDistribution,
      subscriptionDistribution,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.lead.count(),
      prisma.integration.count({ where: { status: 'CONNECTED' } }),
      prisma.organization.groupBy({
        by: ['planId'],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.organization.groupBy({
        by: ['subscriptionStatus'],
        _count: { id: true },
      }),
    ])

    // Calcular MRR (Monthly Recurring Revenue)
    const orgsWithPlans = await prisma.organization.findMany({
      where: { isActive: true, subscriptionStatus: 'ACTIVE' },
      select: { plan: { select: { priceMonthly: true } } },
    })
    const mrr = orgsWithPlans.reduce((sum, org) => sum + org.plan.priceMonthly, 0)

    // Resolver nomes dos planos para distribuicao
    const plans = await prisma.plan.findMany({
      select: { id: true, name: true },
    })
    const planMap = new Map(plans.map(p => [p.id, p.name]))

    return NextResponse.json({
      metrics: {
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        activeUsers,
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        totalIntegrations,
        mrr,
      },
      planDistribution: planDistribution.map(p => ({
        planName: planMap.get(p.planId) || 'Desconhecido',
        count: p._count.id,
      })),
      subscriptionDistribution: subscriptionDistribution.map(s => ({
        status: s.subscriptionStatus,
        count: s._count.id,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return NextResponse.json({ error: 'Erro ao buscar metricas' }, { status: 500 })
  }
})
