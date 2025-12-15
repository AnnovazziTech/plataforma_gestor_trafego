// API Route: Automacoes
// GET - Listar automacoes
// POST - Criar automacao

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

// Automacoes sao armazenadas como JSON no auditLog por enquanto
// Em producao, criar tabela dedicada

const automationSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  type: z.enum(['rule', 'schedule', 'trigger']),
  status: z.enum(['active', 'paused']).default('active'),
  condition: z.object({
    metric: z.enum(['cpa', 'roas', 'ctr', 'cpc', 'impressions', 'conversions']),
    operator: z.enum(['greater_than', 'less_than', 'equal', 'greater_equal', 'less_equal']),
    value: z.number(),
  }),
  period: z.enum(['last_hour', 'last_day', 'last_week']),
  action: z.enum(['pause', 'activate', 'adjust_budget', 'notify']),
  actionValue: z.number().optional(),
  applyTo: z.enum(['campaign', 'ad_set', 'ad']),
  campaignIds: z.array(z.string()).optional(),
})

// GET - Listar automacoes
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Buscar automacoes do audit log
    const where: any = {
      organizationId: ctx.organizationId,
      action: 'automation.created',
    }

    const [automationLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    // Converter para formato de automacao
    const automations = automationLogs.map((log) => {
      const data = log.newData as any
      return {
        id: log.id,
        ...data,
        createdAt: log.createdAt,
      }
    })

    // Filtrar por status se necessario
    const filteredAutomations = status
      ? automations.filter((a) => a.status === status)
      : automations

    // Buscar estatisticas de execucoes
    const executionLogs = await prisma.auditLog.findMany({
      where: {
        organizationId: ctx.organizationId,
        action: 'automation.executed',
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    })

    const stats = {
      total: automations.length,
      active: automations.filter((a) => a.status === 'active').length,
      paused: automations.filter((a) => a.status === 'paused').length,
      executionsThisMonth: executionLogs.length,
    }

    return NextResponse.json({
      automations: filteredAutomations,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar automacoes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar automacoes' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// POST - Criar automacao
export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = automationSchema.parse(body)

    // Verificar se organizacao tem feature de automacao
    const org = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      include: { plan: true },
    })

    if (!org?.plan.hasAutomation) {
      return NextResponse.json(
        { error: 'Seu plano nao inclui automacoes. Faca upgrade para usar esta funcionalidade.' },
        { status: 403 }
      )
    }

    // Criar automacao (salvar no audit log)
    const automationData = {
      ...data,
      organizationId: ctx.organizationId,
      createdBy: ctx.userId,
      executionCount: 0,
      lastExecutedAt: null,
    }

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'automation.created',
      entity: 'automation',
      newData: automationData,
      request: req,
    })

    return NextResponse.json({
      success: true,
      automation: automationData,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar automacao:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar automacao' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
