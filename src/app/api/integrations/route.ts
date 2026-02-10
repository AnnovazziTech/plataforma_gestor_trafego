// API Route: Integrações
// GET - Listar integrações da organização
// POST - Iniciar nova integração

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, checkResourceLimit, createAuditLog } from '@/lib/api/middleware'
import { decrypt } from '@/lib/crypto/encryption'

// GET - Listar integrações
export const GET = withAuth(async (req, ctx) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        name: true,
        platformAccountId: true,
        platformAccountName: true,
        whatsappPhoneNumber: true,
        status: true,
        lastSyncAt: true,
        lastError: true,
        createdAt: true,
        _count: {
          select: {
            campaigns: true,
            conversations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Erro ao listar integrações:', error)
    return NextResponse.json(
      { error: 'Erro ao listar integrações' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })

// POST - Iniciar nova integração
const createIntegrationSchema = z.object({
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'WHATSAPP']),
  returnUrl: z.string().url().optional(),
})

export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const { platform, returnUrl } = createIntegrationSchema.parse(body)

    // Verificar limite de integrações
    const limit = await checkResourceLimit(ctx.organizationId, 'integrations')
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.error },
        { status: 403 }
      )
    }

    // Gerar state para OAuth
    const state = Buffer.from(
      JSON.stringify({
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        platform,
        timestamp: Date.now(),
      })
    ).toString('base64url')

    // URL de callback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/integrations/callback/${platform.toLowerCase()}`

    let authUrl: string

    switch (platform) {
      case 'META':
        const { getMetaOAuthUrl } = await import('@/lib/integrations/meta')
        authUrl = getMetaOAuthUrl(state, redirectUri)
        break

      case 'GOOGLE':
        const { getGoogleOAuthUrl } = await import('@/lib/integrations/google')
        authUrl = getGoogleOAuthUrl(state, redirectUri)
        break

      case 'TIKTOK':
        const { getTikTokOAuthUrl } = await import('@/lib/integrations/tiktok')
        authUrl = getTikTokOAuthUrl(state, redirectUri)
        break

      case 'WHATSAPP':
        // WhatsApp não usa OAuth tradicional, retornar instruções
        return NextResponse.json({
          platform: 'WHATSAPP',
          type: 'manual',
          message: 'Configure o WhatsApp em Configurações > Integrações > WhatsApp',
        })

      default:
        return NextResponse.json(
          { error: 'Plataforma não suportada' },
          { status: 400 }
        )
    }

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'integration.oauth_started',
      entity: 'integration',
      newData: { platform },
      request: req,
    })

    return NextResponse.json({
      authUrl,
      state,
      redirectUri,
    })
  } catch (error) {
    console.error('Erro ao iniciar integração:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao iniciar integração' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })
