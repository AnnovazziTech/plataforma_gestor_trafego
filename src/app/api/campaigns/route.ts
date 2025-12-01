// API Route: Campanhas
// GET - Listar campanhas
// POST - Criar campanha manual

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, checkResourceLimit, createAuditLog } from '@/lib/api/middleware'

// GET - Listar campanhas
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    if (status) {
      where.status = status
    }

    if (platform) {
      where.platform = platform
    }

    // Buscar campanhas com metricas
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          integration: {
            select: {
              name: true,
              platform: true,
            },
          },
          metrics: {
            orderBy: { periodEnd: 'desc' },
            take: 1,
          },
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ])

    // Formatar resposta
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      objective: campaign.objective,
      budget: campaign.budget,
      budgetType: campaign.budgetType,
      spent: campaign.spent,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      integration: campaign.integration,
      metrics: campaign.metrics[0] || null,
      leadsCount: campaign._count.leads,
      lastSyncAt: campaign.lastSyncAt,
      createdAt: campaign.createdAt,
    }))

    return NextResponse.json({
      campaigns: formattedCampaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar campanhas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar campanhas' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// POST - Criar campanha manual
const createCampaignSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'TWITTER']),
  objective: z.enum([
    'AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS',
    'SALES', 'APP_INSTALLS', 'VIDEO_VIEWS', 'MESSAGES', 'CONVERSIONS'
  ]),
  budget: z.number().min(0),
  budgetType: z.enum(['DAILY', 'LIFETIME']).default('DAILY'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  integrationId: z.string().optional(),
})

export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createCampaignSchema.parse(body)

    // Verificar limite de campanhas
    const limit = await checkResourceLimit(ctx.organizationId, 'campaigns')
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.error },
        { status: 403 }
      )
    }

    // Verificar integracao se fornecida
    if (data.integrationId) {
      const integration = await prisma.integration.findFirst({
        where: {
          id: data.integrationId,
          organizationId: ctx.organizationId,
          platform: data.platform,
          status: 'CONNECTED',
        },
      })

      if (!integration) {
        return NextResponse.json(
          { error: 'Integracao invalida ou nao conectada' },
          { status: 400 }
        )
      }
    }

    // Criar campanha
    const campaign = await prisma.campaign.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        platform: data.platform,
        objective: data.objective,
        budget: data.budget,
        budgetType: data.budgetType,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        integrationId: data.integrationId,
        status: 'DRAFT',
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'campaign.created',
      entity: 'campaign',
      entityId: campaign.id,
      newData: data,
      request: req,
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar campanha:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar campanha' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
