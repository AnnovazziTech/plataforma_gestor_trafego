// API Route: Lead Individual
// GET - Buscar lead
// PATCH - Atualizar lead
// DELETE - Deletar lead

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'REMARKETING']).optional(),
  source: z.enum(['META_ADS', 'GOOGLE_ADS', 'TIKTOK_ADS', 'LINKEDIN_ADS', 'WHATSAPP', 'ORGANIC', 'REFERRAL', 'WEBSITE', 'MANUAL', 'OTHER']).optional(),
  value: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  lostReason: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  campaignId: z.string().nullable().optional(),
})

// GET - Buscar lead
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/leads/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do lead obrigatorio' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
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
          take: 20,
        },
        conversations: {
          select: {
            id: true,
            contactPhone: true,
            status: true,
            lastMessageAt: true,
            unreadCount: true,
          },
        },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead nao encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Erro ao buscar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lead' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })

// PATCH - Atualizar lead
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/leads/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do lead obrigatorio' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateLeadSchema.parse(body)

    // Verificar se lead existe
    const existing = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Lead nao encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados de atualizacao
    const updateData: any = { ...data }

    // Se mudou de status, criar historico
    if (data.status && data.status !== existing.status) {
      // Criar entrada no historico
      await prisma.leadHistory.create({
        data: {
          leadId: id,
          fromStatus: existing.status,
          toStatus: data.status,
          note: body.statusNote || null,
          changedById: ctx.userId,
        },
      })

      // Atualizar campos especiais
      if (data.status === 'WON') {
        updateData.convertedAt = new Date()
      } else if (data.status === 'LOST') {
        updateData.lostAt = new Date()
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
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
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'lead.updated',
      entity: 'lead',
      entityId: id,
      oldData: existing,
      newData: data,
      request: req,
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)

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

// DELETE - Deletar lead
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/leads/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do lead obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar se lead existe
    const existing = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Lead nao encontrado' },
        { status: 404 }
      )
    }

    // Deletar lead (cascade deleta historico)
    await prisma.lead.delete({
      where: { id },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'lead.deleted',
      entity: 'lead',
      entityId: id,
      oldData: existing,
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar lead' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })
