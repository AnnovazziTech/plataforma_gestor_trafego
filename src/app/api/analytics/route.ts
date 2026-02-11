// API Route: Analytics
// GET - Buscar dados de analytics

export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withModuleAccess } from '@/lib/api/middleware'

// GET - Buscar dados de analytics
export const GET = withModuleAccess('analytics', async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const accountId = searchParams.get('accountId')
    const platform = searchParams.get('platform')
    const period = searchParams.get('period') || '30'

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

    // Filtros base
    const campaignWhere: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    if (platform) {
      campaignWhere.platform = platform
    }

    if (accountId) {
      campaignWhere.integrationId = accountId
    }

    // Buscar dados de série temporal
    const timeSeriesData = await prisma.campaignDailyMetrics.groupBy({
      by: ['date'],
      where: {
        campaign: campaignWhere,
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

    // Buscar métricas por plataforma
    const platformMetrics = await prisma.campaign.groupBy({
      by: ['platform'],
      where: campaignWhere,
      _sum: {
        spent: true,
      },
      _count: true,
    })

    // Calcular métricas agregadas por plataforma
    const platformDetails = await Promise.all(
      platformMetrics.map(async (p) => {
        const platformFilter = { ...campaignWhere, platform: p.platform }
        const metrics = await prisma.campaignDailyMetrics.aggregate({
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

        const impressions = metrics._sum.impressions || 0
        const clicks = metrics._sum.clicks || 0
        const conversions = metrics._sum.conversions || 0
        const spent = metrics._sum.spent || 0

        return {
          platform: p.platform,
          campaigns: p._count,
          spent,
          impressions,
          clicks,
          conversions,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpc: clicks > 0 ? spent / clicks : 0,
          roas: spent > 0 ? (conversions * 100) / spent : 0,
        }
      })
    )

    // Dados de audiência - requerem integração com APIs de plataformas
    // Retornando arrays vazios até que dados reais sejam sincronizados
    const audienceByDevice: { device: string; value: number }[] = []
    const audienceByAge: { age: string; value: number }[] = []
    const audienceByGender: { gender: string; value: number }[] = []

    // Performance por hora - calculado a partir de métricas diárias quando disponíveis
    // Por hora requer dados granulares das APIs das plataformas
    const hourlyPerformance: { hour: number; impressions: number; clicks: number; conversions: number }[] = []

    // Calcular totais
    const totals = timeSeriesData.reduce(
      (acc, d) => ({
        impressions: acc.impressions + (d._sum.impressions || 0),
        clicks: acc.clicks + (d._sum.clicks || 0),
        conversions: acc.conversions + (d._sum.conversions || 0),
        spent: acc.spent + (d._sum.spent || 0),
        reach: acc.reach + (d._sum.reach || 0),
      }),
      { impressions: 0, clicks: 0, conversions: 0, spent: 0, reach: 0 }
    )

    return NextResponse.json({
      timeSeriesData: timeSeriesData.map((d) => ({
        date: d.date,
        impressions: d._sum.impressions || 0,
        clicks: d._sum.clicks || 0,
        conversions: d._sum.conversions || 0,
        spent: d._sum.spent || 0,
        reach: d._sum.reach || 0,
      })),
      platformMetrics: platformDetails,
      totals: {
        ...totals,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        cpc: totals.clicks > 0 ? totals.spent / totals.clicks : 0,
        cpm: totals.impressions > 0 ? (totals.spent / totals.impressions) * 1000 : 0,
        roas: totals.spent > 0 ? (totals.conversions * 100) / totals.spent : 0,
      },
      audienceByDevice,
      audienceByAge,
      audienceByGender,
      hourlyPerformance,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar analytics' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })
