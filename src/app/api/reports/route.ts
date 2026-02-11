// API Route: Relatórios
// GET - Listar relatórios
// POST - Criar relatório

export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, withModuleAccess, createAuditLog } from '@/lib/api/middleware'

// Schema para criar relatório
const createReportSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  type: z.enum(['PERFORMANCE', 'AUDIENCE', 'CREATIVE', 'CUSTOM']).default('PERFORMANCE'),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).default('ONCE'),
  platforms: z.array(z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'WHATSAPP'])).min(1, 'Selecione pelo menos uma plataforma'),
  metrics: z.array(z.string()).min(1, 'Selecione pelo menos uma métrica'),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  recipients: z.array(z.string()).optional().default([]),
  sendMethod: z.enum(['EMAIL', 'WHATSAPP', 'DOWNLOAD']).optional(),
})

// GET - Listar relatórios
export const GET = withModuleAccess('relatorios', async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (type) {
      where.type = type.toUpperCase()
    }

    // Buscar relatórios
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ])

    // Buscar estatísticas
    const stats = await prisma.report.groupBy({
      by: ['status'],
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
      },
      _count: true,
    })

    // Formatar para o frontend
    const formattedReports = reports.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type.toLowerCase(),
      frequency: r.frequency.toLowerCase(),
      status: r.status.toLowerCase(),
      platforms: r.platforms.map(p => p.toLowerCase()),
      metrics: r.metrics,
      dateRange: {
        start: r.dateRangeStart.toISOString(),
        end: r.dateRangeEnd.toISOString(),
      },
      recipients: r.recipients,
      sendMethod: r.sendMethod?.toLowerCase(),
      lastGenerated: r.lastGenerated?.toISOString(),
      generatedCount: r.generatedCount,
      reportData: r.reportData,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      reports: formattedReports,
      stats: {
        total,
        active: stats.find(s => s.status === 'ACTIVE')?._count || 0,
        paused: stats.find(s => s.status === 'PAUSED')?._count || 0,
        byStatus: stats,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao listar relatórios' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })

// POST - Criar relatório
export const POST = withModuleAccess('relatorios', async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createReportSchema.parse(body)

    const startDate = new Date(data.dateRange.start)
    const endDate = new Date(data.dateRange.end)

    // Criar o relatório no banco
    const report = await prisma.report.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        type: data.type as any,
        frequency: data.frequency as any,
        status: 'ACTIVE',
        platforms: data.platforms as any[],
        metrics: data.metrics,
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        recipients: data.recipients || [],
        sendMethod: data.sendMethod as any,
      },
    })

    // Gerar dados do relatório baseado nas campanhas
    const campaignWhere: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    if (data.platforms.length > 0) {
      campaignWhere.platform = { in: data.platforms }
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
        integration: {
          select: {
            name: true,
            platform: true,
          },
        },
      },
    })

    // Agregar métricas
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

        // Adicionar a dados diários
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

    // Calcular métricas derivadas
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

    // Ordenar dados diários
    dailyData.sort((a, b) => a.date.localeCompare(b.date))

    const reportData = {
      aggregatedMetrics,
      dailyData,
      campaignData,
      totalCampaigns: campaigns.length,
      generatedAt: new Date().toISOString(),
    }

    // Atualizar o relatório com os dados gerados
    await prisma.report.update({
      where: { id: report.id },
      data: {
        reportData,
        lastGenerated: new Date(),
        generatedCount: { increment: 1 },
      },
    })

    // Registrar no audit log
    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'report.created',
      entity: 'report',
      entityId: report.id,
      newData: { name: report.name, type: report.type },
      request: req,
    })

    // Formatar resposta
    const formattedReport = {
      id: report.id,
      name: report.name,
      type: report.type.toLowerCase(),
      frequency: report.frequency.toLowerCase(),
      status: report.status.toLowerCase(),
      platforms: report.platforms.map(p => p.toLowerCase()),
      metrics: report.metrics,
      dateRange: {
        start: report.dateRangeStart.toISOString(),
        end: report.dateRangeEnd.toISOString(),
      },
      recipients: report.recipients,
      sendMethod: report.sendMethod?.toLowerCase(),
      lastGenerated: new Date().toISOString(),
      generatedCount: 1,
      createdAt: report.createdAt.toISOString(),
      reportData,
    }

    return NextResponse.json({
      success: true,
      report: formattedReport,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar relatório' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })
