// API Route: Leads (CRM/Funil)
// GET - Listar leads
// POST - Criar lead manual

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, checkResourceLimit, createAuditLog } from '@/lib/api/middleware'
import { sendConversionEvent, extractClientIp, extractUserAgent } from '@/lib/meta/conversions-api'

// GET - Listar leads
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const campaignId = searchParams.get('campaignId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId: ctx.organizationId,
    }

    if (status) {
      // Suporta multiplos status separados por virgula
      const statuses = status.split(',')
      where.status = { in: statuses }
    }

    if (source) {
      where.source = source
    }

    if (campaignId) {
      where.campaignId = campaignId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Buscar leads com historico
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              platform: true,
            },
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { conversations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    // Agrupar por status para estatisticas
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      where: { organizationId: ctx.organizationId },
      _count: true,
    })

    return NextResponse.json({
      leads,
      stats: {
        total,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
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
      { error: 'Erro ao listar leads' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })

// POST - Criar lead manual
const createLeadSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.enum([
    'META_ADS', 'GOOGLE_ADS', 'TIKTOK_ADS', 'LINKEDIN_ADS',
    'WHATSAPP', 'ORGANIC', 'REFERRAL', 'WEBSITE', 'MANUAL', 'OTHER'
  ]).default('MANUAL'),
  sourceDetails: z.string().optional(),
  campaignId: z.string().optional(),
  status: z.enum([
    'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL',
    'NEGOTIATION', 'WON', 'LOST', 'REMARKETING'
  ]).default('NEW'),
  value: z.number().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
})

export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createLeadSchema.parse(body)

    // Verificar limite de leads
    const limit = await checkResourceLimit(ctx.organizationId, 'leads')
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.error },
        { status: 403 }
      )
    }

    // Verificar se campanha existe e pertence a organizacao
    if (data.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: data.campaignId,
          organizationId: ctx.organizationId,
        },
      })

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campanha nao encontrada' },
          { status: 400 }
        )
      }
    }

    // Criar lead com historico inicial
    const lead = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          organizationId: ctx.organizationId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          source: data.source,
          sourceDetails: data.sourceDetails,
          campaignId: data.campaignId,
          status: data.status,
          value: data.value,
          notes: data.notes,
          customFields: data.customFields,
        },
      })

      // Criar entrada no historico
      await tx.leadHistory.create({
        data: {
          leadId: lead.id,
          toStatus: data.status,
          note: 'Lead criado manualmente',
          changedById: ctx.userId,
        },
      })

      return lead
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'lead.created',
      entity: 'lead',
      entityId: lead.id,
      newData: data,
      request: req,
    })

    // Meta Conversions API: Lead
    sendConversionEvent({
      event_name: 'Lead',
      user_data: {
        em: data.email || undefined,
        ph: data.phone || undefined,
        fn: data.name,
        client_ip_address: extractClientIp(req),
        client_user_agent: extractUserAgent(req),
      },
      custom_data: {
        content_name: data.source,
        value: data.value,
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })

// PATCH - Atualizar status do lead (funil)
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const { leadId, status, note } = z.object({
      leadId: z.string(),
      status: z.enum([
        'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL',
        'NEGOTIATION', 'WON', 'LOST', 'REMARKETING'
      ]),
      note: z.string().optional(),
    }).parse(body)

    // Buscar lead atual
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: ctx.organizationId,
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead nao encontrado' },
        { status: 404 }
      )
    }

    const previousStatus = lead.status

    // Atualizar lead e criar historico
    const updatedLead = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      }

      // Se mudou para WON, registrar data de conversao
      if (status === 'WON' && previousStatus !== 'WON') {
        updateData.convertedAt = new Date()
      }

      // Se mudou para LOST, registrar data
      if (status === 'LOST' && previousStatus !== 'LOST') {
        updateData.lostAt = new Date()
        if (note) updateData.lostReason = note
      }

      const lead = await tx.lead.update({
        where: { id: leadId },
        data: updateData,
      })

      // Criar entrada no historico
      await tx.leadHistory.create({
        data: {
          leadId: lead.id,
          fromStatus: previousStatus,
          toStatus: status,
          note,
          changedById: ctx.userId,
        },
      })

      return lead
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'lead.status_changed',
      entity: 'lead',
      entityId: leadId,
      oldData: { status: previousStatus },
      newData: { status, note },
      request: req,
    })

    return NextResponse.json({ lead: updatedLead })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })
