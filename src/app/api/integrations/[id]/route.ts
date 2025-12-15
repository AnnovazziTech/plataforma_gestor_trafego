// API Route: Integracao Individual
// GET - Buscar integracao
// PATCH - Atualizar integracao
// DELETE - Deletar/Desconectar integracao

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

const updateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['PENDING', 'CONNECTED', 'ERROR', 'EXPIRED', 'DISCONNECTED']).optional(),
})

// GET - Buscar integracao
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/integrations/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da integracao obrigatorio' },
        { status: 400 }
      )
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        adAccounts: {
          where: { isActive: true },
        },
        _count: {
          select: {
            campaigns: true,
            conversations: true,
          },
        },
      },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integracao nao encontrada' },
        { status: 404 }
      )
    }

    // Remover tokens da resposta
    const safeIntegration = {
      id: integration.id,
      platform: integration.platform,
      name: integration.name,
      status: integration.status,
      platformAccountId: integration.platformAccountId,
      platformAccountName: integration.platformAccountName,
      whatsappPhoneNumber: integration.whatsappPhoneNumber,
      lastSyncAt: integration.lastSyncAt,
      lastErrorAt: integration.lastErrorAt,
      lastError: integration.lastError,
      tokenExpiresAt: integration.tokenExpiresAt,
      createdAt: integration.createdAt,
      adAccounts: integration.adAccounts,
      campaignsCount: integration._count.campaigns,
      conversationsCount: integration._count.conversations,
    }

    return NextResponse.json({ integration: safeIntegration })
  } catch (error) {
    console.error('Erro ao buscar integracao:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar integracao' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })

// PATCH - Atualizar integracao
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/integrations/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da integracao obrigatorio' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateIntegrationSchema.parse(body)

    // Verificar se integracao existe
    const existing = await prisma.integration.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Integracao nao encontrada' },
        { status: 404 }
      )
    }

    const integration = await prisma.integration.update({
      where: { id },
      data,
      select: {
        id: true,
        platform: true,
        name: true,
        status: true,
        lastSyncAt: true,
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'integration.updated',
      entity: 'integration',
      entityId: id,
      oldData: { name: existing.name, status: existing.status },
      newData: data,
      request: req,
    })

    return NextResponse.json({ integration })
  } catch (error) {
    console.error('Erro ao atualizar integracao:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar integracao' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })

// DELETE - Desconectar integracao
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/integrations/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da integracao obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar se integracao existe
    const existing = await prisma.integration.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        _count: {
          select: {
            campaigns: true,
            conversations: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Integracao nao encontrada' },
        { status: 404 }
      )
    }

    // Marcar como desconectada (soft delete)
    await prisma.integration.update({
      where: { id },
      data: {
        status: 'DISCONNECTED',
        isActive: false,
        accessToken: '', // Limpar tokens
        refreshToken: null,
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'integration.disconnected',
      entity: 'integration',
      entityId: id,
      oldData: {
        platform: existing.platform,
        name: existing.name,
        campaignsCount: existing._count.campaigns,
        conversationsCount: existing._count.conversations,
      },
      request: req,
    })

    return NextResponse.json({
      success: true,
      message: 'Integracao desconectada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao desconectar integracao:', error)
    return NextResponse.json(
      { error: 'Erro ao desconectar integracao' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })
