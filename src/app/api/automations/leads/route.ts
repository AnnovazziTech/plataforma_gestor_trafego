// API Route: Automacoes de Leads / Remarketing
// GET - Listar regras de remarketing
// POST - Criar regra de remarketing

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

// Schema para regras de remarketing
const leadAutomationSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  type: z.enum(['lead_status_change', 'lead_inactivity', 'lead_remarketing']),
  status: z.enum(['active', 'paused']).default('active'),
  trigger: z.object({
    // Para lead_status_change
    fromStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'REMARKETING']).optional(),
    toStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'REMARKETING']).optional(),
    // Para lead_inactivity
    inactiveDays: z.number().min(1).max(365).optional(),
    // Para lead_remarketing
    lostDaysAgo: z.number().min(1).max(365).optional(),
  }),
  action: z.object({
    type: z.enum(['change_status', 'send_message', 'create_task', 'notify']),
    // Para change_status
    newStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'REMARKETING']).optional(),
    // Para send_message
    messageTemplate: z.string().optional(),
    messageChannel: z.enum(['whatsapp', 'email', 'sms']).optional(),
    // Para create_task
    taskTitle: z.string().optional(),
    taskAssignee: z.string().optional(),
    // Para notify
    notificationMessage: z.string().optional(),
  }),
  filters: z.object({
    sources: z.array(z.string()).optional(),
    campaigns: z.array(z.string()).optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
  }).optional(),
})

// GET - Listar regras de remarketing
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Buscar automacoes de leads do audit log
    const where: any = {
      organizationId: ctx.organizationId,
      action: 'lead_automation.created',
    }

    const automationLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Converter para formato de automacao
    let automations = automationLogs.map((log) => {
      const data = log.newData as any
      return {
        id: log.id,
        ...data,
        createdAt: log.createdAt,
      }
    })

    // Filtrar por status e tipo
    if (status) {
      automations = automations.filter((a) => a.status === status)
    }
    if (type) {
      automations = automations.filter((a) => a.type === type)
    }

    // Buscar estatisticas de execucoes
    const executionLogs = await prisma.auditLog.findMany({
      where: {
        organizationId: ctx.organizationId,
        action: 'lead_automation.executed',
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    })

    // Contar leads em REMARKETING
    const remarketingLeads = await prisma.lead.count({
      where: {
        organizationId: ctx.organizationId,
        status: 'REMARKETING',
      },
    })

    // Contar leads perdidos recuperaveis (LOST nos ultimos 90 dias)
    const recoverableLeads = await prisma.lead.count({
      where: {
        organizationId: ctx.organizationId,
        status: 'LOST',
        lostAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 90)),
        },
      },
    })

    const stats = {
      total: automations.length,
      active: automations.filter((a) => a.status === 'active').length,
      paused: automations.filter((a) => a.status === 'paused').length,
      executionsThisMonth: executionLogs.length,
      remarketingLeads,
      recoverableLeads,
    }

    return NextResponse.json({
      automations,
      stats,
    })
  } catch (error) {
    console.error('Erro ao listar automacoes de leads:', error)
    return NextResponse.json(
      { error: 'Erro ao listar automacoes de leads' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// POST - Criar regra de remarketing
export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = leadAutomationSchema.parse(body)

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

    // Criar automacao de lead
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
      action: 'lead_automation.created',
      entity: 'lead_automation',
      newData: automationData,
      request: req,
    })

    return NextResponse.json({
      success: true,
      automation: automationData,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar automacao de lead:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar automacao de lead' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
