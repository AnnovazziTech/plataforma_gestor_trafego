// API Route: Relatorios
// GET - Listar relatorios
// POST - Criar relatorio

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

// Schema para criar relatorio
const createReportSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  type: z.enum(['performance', 'audience', 'creative', 'custom']).default('performance'),
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'TWITTER']).optional(),
  integrationId: z.string().optional(),
  metrics: z.array(z.string()).min(1, 'Selecione pelo menos uma metrica'),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).default('once'),
  recipients: z.array(z.string()).optional(),
  sendMethod: z.enum(['email', 'whatsapp', 'download']).optional(),
})

// GET - Listar relatorios
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Buscar relatorios do audit log (tipo report.generated)
    const [reports, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          organizationId: ctx.organizationId,
          action: { startsWith: 'report.' },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({
        where: {
          organizationId: ctx.organizationId,
          action: { startsWith: 'report.' },
        },
      }),
    ])

    // Buscar estatisticas
    const stats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        organizationId: ctx.organizationId,
        action: { startsWith: 'report.' },
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      _count: true,
    })

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        action: r.action,
        data: r.newData,
        createdAt: r.createdAt,
        userEmail: r.userEmail,
      })),
      stats: {
        generatedThisMonth: stats.reduce((acc, s) => acc + s._count, 0),
        byType: stats,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar relatorios:', error)
    return NextResponse.json(
      { error: 'Erro ao listar relatorios' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })

// POST - Criar/Gerar relatorio
export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createReportSchema.parse(body)

    const startDate = new Date(data.dateRange.start)
    const endDate = new Date(data.dateRange.end)

    // Construir filtros de campanha
    const campaignWhere: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    if (data.platform) {
      campaignWhere.platform = data.platform
    }

    if (data.integrationId) {
      campaignWhere.integrationId = data.integrationId
    }

    // Buscar dados das campanhas
    const campaigns = await prisma.campaign.findMany({
      where: campaignWhere,
      include: {
        dailyMetrics: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { date: 'asc' },
        },
        metrics: {
          where: {
            periodStart: { gte: startDate },
            periodEnd: { lte: endDate },
          },
        },
        integration: {
          select: {
            name: true,
            platform: true,
          },
        },
      },
    })

    // Agregar metricas
    const aggregatedMetrics = {
      totalSpent: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalReach: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      roas: 0,
    }

    const dailyData: any[] = []
    const campaignData: any[] = []

    campaigns.forEach((campaign) => {
      let campaignSpent = 0
      let campaignImpressions = 0
      let campaignClicks = 0
      let campaignConversions = 0

      campaign.dailyMetrics.forEach((metric) => {
        aggregatedMetrics.totalSpent += metric.spent
        aggregatedMetrics.totalImpressions += metric.impressions
        aggregatedMetrics.totalClicks += metric.clicks
        aggregatedMetrics.totalConversions += metric.conversions
        aggregatedMetrics.totalReach += metric.reach

        campaignSpent += metric.spent
        campaignImpressions += metric.impressions
        campaignClicks += metric.clicks
        campaignConversions += metric.conversions

        // Adicionar a dados diarios
        const dateStr = metric.date.toISOString().split('T')[0]
        const existing = dailyData.find((d) => d.date === dateStr)
        if (existing) {
          existing.spent += metric.spent
          existing.impressions += metric.impressions
          existing.clicks += metric.clicks
          existing.conversions += metric.conversions
        } else {
          dailyData.push({
            date: dateStr,
            spent: metric.spent,
            impressions: metric.impressions,
            clicks: metric.clicks,
            conversions: metric.conversions,
          })
        }
      })

      campaignData.push({
        id: campaign.id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        spent: campaignSpent,
        impressions: campaignImpressions,
        clicks: campaignClicks,
        conversions: campaignConversions,
        ctr: campaignImpressions > 0 ? (campaignClicks / campaignImpressions) * 100 : 0,
        roas: campaignSpent > 0 ? (campaignConversions * 100) / campaignSpent : 0,
      })
    })

    // Calcular metricas derivadas
    if (aggregatedMetrics.totalImpressions > 0) {
      aggregatedMetrics.ctr = (aggregatedMetrics.totalClicks / aggregatedMetrics.totalImpressions) * 100
      aggregatedMetrics.cpm = (aggregatedMetrics.totalSpent / aggregatedMetrics.totalImpressions) * 1000
    }
    if (aggregatedMetrics.totalClicks > 0) {
      aggregatedMetrics.cpc = aggregatedMetrics.totalSpent / aggregatedMetrics.totalClicks
    }
    if (aggregatedMetrics.totalSpent > 0) {
      aggregatedMetrics.roas = (aggregatedMetrics.totalConversions * 100) / aggregatedMetrics.totalSpent
    }

    // Ordenar dados diarios
    dailyData.sort((a, b) => a.date.localeCompare(b.date))

    const reportData = {
      name: data.name,
      type: data.type,
      platform: data.platform,
      dateRange: data.dateRange,
      metrics: data.metrics,
      generatedAt: new Date().toISOString(),
      aggregatedMetrics,
      dailyData,
      campaignData,
      totalCampaigns: campaigns.length,
    }

    // Registrar no audit log
    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'report.generated',
      entity: 'report',
      newData: reportData,
      request: req,
    })

    return NextResponse.json({
      success: true,
      report: reportData,
    })
  } catch (error) {
    console.error('Erro ao gerar relatorio:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao gerar relatorio' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })
