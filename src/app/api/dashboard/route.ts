// API Route: Dashboard
// GET - Buscar metricas agregadas do dashboard

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

// GET - Buscar metricas do dashboard
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const accountId = searchParams.get('accountId')
    const period = searchParams.get('period') || '30' // dias (fallback)

    let startDate: Date
    let endDate: Date

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const periodDays = parseInt(period)
      startDate = new Date()
      startDate.setDate(startDate.getDate() - periodDays)
      endDate = new Date()
    }

    // Calcular periodo anterior para comparacao
    const periodMs = endDate.getTime() - startDate.getTime()
    const previousStartDate = new Date(startDate.getTime() - periodMs)
    const previousEndDate = new Date(startDate.getTime() - 1)

    // Filtro base de campanhas
    const campaignFilter: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    // Adicionar filtro por conta se especificado
    if (accountId) {
      campaignFilter.integrationId = accountId
    }

    // Buscar campanhas ativas
    const campaigns = await prisma.campaign.findMany({
      where: campaignFilter,
      include: {
        metrics: {
          where: {
            periodEnd: { gte: startDate, lte: endDate },
          },
          orderBy: { periodEnd: 'desc' },
        },
        dailyMetrics: {
          where: {
            date: { gte: startDate, lte: endDate },
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
    const previousCampaignFilter: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }
    if (accountId) {
      previousCampaignFilter.integrationId = accountId
    }

    const previousMetrics = await prisma.campaignDailyMetrics.aggregate({
      where: {
        campaign: previousCampaignFilter,
        date: {
          gte: previousStartDate,
          lte: previousEndDate,
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
        campaign: campaignFilter,
        date: { gte: startDate, lte: endDate },
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
      where: campaignFilter,
      _sum: {
        spent: true,
      },
      _count: true,
    })

    // Buscar top campanhas
    const topCampaignsFilter = { ...campaignFilter, status: 'ACTIVE' }
    const topCampaigns = await prisma.campaign.findMany({
      where: topCampaignsFilter,
      include: {
        metrics: {
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
      },
      orderBy: { spent: 'desc' },
      take: 5,
    })

    // Buscar contagens (aplicando filtro de conta se especificado)
    const [totalCampaigns, activeCampaigns, totalLeads, totalConversations] = await Promise.all([
      prisma.campaign.count({
        where: campaignFilter,
      }),
      prisma.campaign.count({
        where: topCampaignsFilter,
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

    // Calcular total budget
    const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0)

    // Calcular metricas por plataforma com mais detalhes
    const platformMetricsDetailed = await Promise.all(
      platformMetrics.map(async (p) => {
        const platformFilter = { ...campaignFilter, platform: p.platform }
        const platformDailyMetrics = await prisma.campaignDailyMetrics.aggregate({
          where: {
            campaign: platformFilter,
            date: { gte: startDate, lte: endDate },
          },
          _sum: {
            impressions: true,
            clicks: true,
            conversions: true,
            spent: true,
          },
        })

        const spent = platformDailyMetrics._sum.spent || 0
        const conversions = platformDailyMetrics._sum.conversions || 0

        return {
          platform: p.platform,
          spent,
          impressions: platformDailyMetrics._sum.impressions || 0,
          clicks: platformDailyMetrics._sum.clicks || 0,
          conversions,
          roas: spent > 0 ? (conversions * 100) / spent : 0,
          campaigns: p._count,
        }
      })
    )

    // Calcular funil de conversao
    const conversionFunnel = [
      { stage: 'Impressoes', value: totalImpressions, percentage: 100 },
      { stage: 'Cliques', value: totalClicks, percentage: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0 },
      { stage: 'Leads', value: totalLeads, percentage: totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0 },
      { stage: 'Conversoes', value: totalConversions, percentage: totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0 },
    ]

    // Calcular performance por campanha
    const campaignPerformance = topCampaigns.map((c) => {
      const metrics = c.metrics[0]
      return {
        name: c.name,
        spent: c.spent,
        conversions: metrics?.conversions || 0,
        roas: metrics?.roas || 0,
        ctr: metrics?.ctr || 0,
      }
    })

    return NextResponse.json({
      metrics: {
        totalSpent,
        totalBudget,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalRevenue: totalConversions * 100, // Estimativa
        avgCtr: ctr,
        avgCpc: cpc,
        avgRoas,
        activeCampaigns,
      },
      previousPeriod: {
        totalSpent: prevSpent,
        totalImpressions: prevImpressions,
        totalClicks: prevClicks,
        totalConversions: prevConversions,
        totalRevenue: prevConversions * 100,
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
        revenue: (d._sum.conversions || 0) * 100,
      })),
      platformMetrics: platformMetricsDetailed,
      conversionFunnel,
      campaignPerformance,
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
