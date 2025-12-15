// API Route: Dashboard
// GET - Buscar metricas agregadas do dashboard

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

// GET - Buscar metricas do dashboard
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30' // dias
    const periodDays = parseInt(period)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - (periodDays * 2))

    // Buscar campanhas ativas
    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
      },
      include: {
        metrics: {
          where: {
            periodEnd: { gte: startDate },
          },
          orderBy: { periodEnd: 'desc' },
        },
        dailyMetrics: {
          where: {
            date: { gte: startDate },
          },
          orderBy: { date: 'asc' },
        },
      },
    })

    // Calcular metricas agregadas do periodo atual
    let totalSpent = 0
    let totalImpressions = 0
    let totalClicks = 0
    let totalConversions = 0
    let totalReach = 0

    campaigns.forEach((campaign) => {
      campaign.dailyMetrics.forEach((metric) => {
        totalSpent += metric.spent
        totalImpressions += metric.impressions
        totalClicks += metric.clicks
        totalConversions += metric.conversions
        totalReach += metric.reach
      })
    })

    // Calcular CTR, CPC, ROAS
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0
    const avgRoas = totalSpent > 0 ? (totalConversions * 100) / totalSpent : 0 // Assumindo valor medio de R$100 por conversao

    // Buscar metricas do periodo anterior para comparacao
    const previousMetrics = await prisma.campaignDailyMetrics.aggregate({
      where: {
        campaign: {
          organizationId: ctx.organizationId,
          isActive: true,
        },
        date: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _sum: {
        spent: true,
        impressions: true,
        clicks: true,
        conversions: true,
        reach: true,
      },
    })

    const prevSpent = previousMetrics._sum.spent || 0
    const prevImpressions = previousMetrics._sum.impressions || 0
    const prevClicks = previousMetrics._sum.clicks || 0
    const prevConversions = previousMetrics._sum.conversions || 0

    // Calcular mudancas percentuais
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    // Buscar dados de serie temporal
    const timeSeriesData = await prisma.campaignDailyMetrics.groupBy({
      by: ['date'],
      where: {
        campaign: {
          organizationId: ctx.organizationId,
          isActive: true,
        },
        date: { gte: startDate },
      },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        spent: true,
        reach: true,
      },
      orderBy: { date: 'asc' },
    })

    // Buscar metricas por plataforma
    const platformMetrics = await prisma.campaign.groupBy({
      by: ['platform'],
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
      },
      _sum: {
        spent: true,
      },
      _count: true,
    })

    // Buscar top campanhas
    const topCampaigns = await prisma.campaign.findMany({
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
        status: 'ACTIVE',
      },
      include: {
        metrics: {
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
      },
      orderBy: { spent: 'desc' },
      take: 5,
    })

    // Buscar contagens
    const [totalCampaigns, activeCampaigns, totalLeads, totalConversations] = await Promise.all([
      prisma.campaign.count({
        where: { organizationId: ctx.organizationId, isActive: true },
      }),
      prisma.campaign.count({
        where: { organizationId: ctx.organizationId, isActive: true, status: 'ACTIVE' },
      }),
      prisma.lead.count({
        where: { organizationId: ctx.organizationId },
      }),
      prisma.conversation.count({
        where: { organizationId: ctx.organizationId, isActive: true },
      }),
    ])

    // Buscar atividades recentes
    const recentActivities = await prisma.auditLog.findMany({
      where: {
        organizationId: ctx.organizationId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      metrics: {
        totalSpent,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalReach,
        ctr,
        cpc,
        avgRoas,
        totalRevenue: totalConversions * 100, // Estimativa
      },
      changes: {
        spent: calcChange(totalSpent, prevSpent),
        impressions: calcChange(totalImpressions, prevImpressions),
        clicks: calcChange(totalClicks, prevClicks),
        conversions: calcChange(totalConversions, prevConversions),
      },
      counts: {
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        totalConversations,
      },
      timeSeriesData: timeSeriesData.map((d) => ({
        date: d.date,
        impressions: d._sum.impressions || 0,
        clicks: d._sum.clicks || 0,
        conversions: d._sum.conversions || 0,
        spent: d._sum.spent || 0,
        reach: d._sum.reach || 0,
      })),
      platformMetrics: platformMetrics.map((p) => ({
        platform: p.platform,
        spent: p._sum.spent || 0,
        campaigns: p._count,
      })),
      topCampaigns: topCampaigns.map((c) => ({
        id: c.id,
        name: c.name,
        platform: c.platform,
        status: c.status,
        spent: c.spent,
        budget: c.budget,
        metrics: c.metrics[0] || null,
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId,
        userEmail: a.userEmail,
        createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dashboard' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })
