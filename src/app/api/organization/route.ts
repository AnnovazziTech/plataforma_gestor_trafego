// API Route: Organizacao
// GET - Buscar dados da organizacao
// PATCH - Atualizar organizacao

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

// GET - Buscar dados da organizacao
export const GET = withAuth(async (req, ctx) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      include: {
        plan: true,
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { role: 'asc' },
        },
        _count: {
          select: {
            campaigns: true,
            leads: true,
            integrations: true,
            creatives: true,
            conversations: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organizacao nao encontrada' },
        { status: 404 }
      )
    }

    // Calcular uso vs limites
    const usage = {
      users: {
        current: organization.members.length,
        max: organization.plan.maxUsers,
        percentage: (organization.members.length / organization.plan.maxUsers) * 100,
      },
      campaigns: {
        current: organization._count.campaigns,
        max: organization.plan.maxCampaigns,
        percentage: (organization._count.campaigns / organization.plan.maxCampaigns) * 100,
      },
      leads: {
        current: organization._count.leads,
        max: organization.plan.maxLeads,
        percentage: (organization._count.leads / organization.plan.maxLeads) * 100,
      },
      integrations: {
        current: organization._count.integrations,
        max: organization.plan.maxIntegrations,
        percentage: (organization._count.integrations / organization.plan.maxIntegrations) * 100,
      },
      creatives: {
        current: organization._count.creatives,
        max: organization.plan.maxCreatives,
        percentage: (organization._count.creatives / organization.plan.maxCreatives) * 100,
      },
    }

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        website: organization.website,
        timezone: organization.timezone,
        language: organization.language,
        subscriptionStatus: organization.subscriptionStatus,
        trialEndsAt: organization.trialEndsAt,
        createdAt: organization.createdAt,
      },
      plan: organization.plan,
      members: organization.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
        permissions: {
          canManageCampaigns: m.canManageCampaigns,
          canManageLeads: m.canManageLeads,
          canManageIntegrations: m.canManageIntegrations,
          canManageBilling: m.canManageBilling,
          canManageMembers: m.canManageMembers,
          canViewReports: m.canViewReports,
        },
        acceptedAt: m.acceptedAt,
      })),
      usage,
      features: {
        hasAiAnalysis: organization.plan.hasAiAnalysis,
        hasAdvancedReports: organization.plan.hasAdvancedReports,
        hasAutomation: organization.plan.hasAutomation,
        hasApiAccess: organization.plan.hasApiAccess,
        hasPrioritySupport: organization.plan.hasPrioritySupport,
        hasWhiteLabel: organization.plan.hasWhiteLabel,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar organizacao' },
      { status: 500 }
    )
  }
})

// PATCH - Atualizar organizacao
export const PATCH = withAuth(async (req, ctx) => {
  try {
    // Verificar permissao
    if (ctx.role !== 'OWNER' && ctx.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas owners e admins podem atualizar a organizacao' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = updateOrgSchema.parse(body)

    const existing = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
    })

    const organization = await prisma.organization.update({
      where: { id: ctx.organizationId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        website: true,
        timezone: true,
        language: true,
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'organization.updated',
      entity: 'organization',
      entityId: ctx.organizationId,
      oldData: existing,
      newData: data,
      request: req,
    })

    return NextResponse.json({ organization })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar organizacao' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageMembers'] })
