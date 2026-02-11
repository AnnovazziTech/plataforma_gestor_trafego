// API Route: Campanha Individual
// GET - Buscar campanha por ID
// PATCH - Atualizar campanha
// DELETE - Deletar campanha

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

// GET - Buscar campanha por ID
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/campaigns/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da campanha obrigatorio' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            platform: true,
            status: true,
          },
        },
        adAccount: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        metrics: {
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
        dailyMetrics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        _count: {
          select: { leads: true },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha nao encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar campanha' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// PATCH - Atualizar campanha
const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'ENDED', 'ERROR', 'ARCHIVED']).optional(),
  objective: z.enum([
    'AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS',
    'SALES', 'APP_INSTALLS', 'VIDEO_VIEWS', 'MESSAGES', 'CONVERSIONS'
  ]).optional(),
  budget: z.number().min(0).optional(),
  budgetType: z.enum(['DAILY', 'LIFETIME']).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
})

export const PATCH = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/campaigns/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da campanha obrigatorio' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateCampaignSchema.parse(body)

    // Verificar se campanha existe
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campanha nao encontrada' },
        { status: 404 }
      )
    }

    // Atualizar campanha
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate === null ? null : data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate === null ? null : data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            platform: true,
          },
        },
        metrics: {
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'campaign.updated',
      entity: 'campaign',
      entityId: campaign.id,
      oldData: existingCampaign,
      newData: data,
      request: req,
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar campanha' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// DELETE - Deletar campanha (soft delete)
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/campaigns/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da campanha obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar se campanha existe
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campanha nao encontrada' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.campaign.update({
      where: { id },
      data: {
        isActive: false,
        status: 'ARCHIVED',
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'campaign.deleted',
      entity: 'campaign',
      entityId: id,
      oldData: existingCampaign,
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar campanha' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
