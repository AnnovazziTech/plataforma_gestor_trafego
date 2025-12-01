// API Route: Integracao WhatsApp
// POST - Configurar WhatsApp (Evolution API ou Cloud API)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, checkResourceLimit, createAuditLog } from '@/lib/api/middleware'
import { encrypt } from '@/lib/crypto/encryption'
import {
  createEvolutionInstance,
  getEvolutionInstanceStatus,
} from '@/lib/integrations/whatsapp'

// Schema para Evolution API
const evolutionSchema = z.object({
  type: z.literal('evolution'),
  name: z.string().min(1, 'Nome obrigatorio'),
  instanceName: z.string().min(1, 'Nome da instancia obrigatorio'),
})

// Schema para Cloud API
const cloudSchema = z.object({
  type: z.literal('cloud'),
  name: z.string().min(1, 'Nome obrigatorio'),
  phoneNumberId: z.string().min(1, 'Phone Number ID obrigatorio'),
  accessToken: z.string().min(1, 'Access Token obrigatorio'),
  businessAccountId: z.string().optional(),
})

const whatsappSchema = z.discriminatedUnion('type', [evolutionSchema, cloudSchema])

// POST - Configurar nova conexao WhatsApp
export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = whatsappSchema.parse(body)

    // Verificar limite de integracoes
    const limit = await checkResourceLimit(ctx.organizationId, 'integrations')
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.error },
        { status: 403 }
      )
    }

    if (data.type === 'evolution') {
      // Criar instancia no Evolution API
      const result = await createEvolutionInstance(data.instanceName)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Erro ao criar instancia' },
          { status: 400 }
        )
      }

      // Salvar integracao com status pendente (aguardando QR code)
      const integration = await prisma.integration.create({
        data: {
          organizationId: ctx.organizationId,
          platform: 'WHATSAPP',
          name: data.name,
          accessToken: encrypt(data.instanceName), // Guardar nome da instancia criptografado
          platformAccountId: data.instanceName,
          status: 'PENDING',
        },
      })

      await createAuditLog({
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: 'integration.whatsapp_created',
        entity: 'integration',
        entityId: integration.id,
        newData: { type: 'evolution', instanceName: data.instanceName },
        request: req,
      })

      return NextResponse.json({
        integration: {
          id: integration.id,
          name: integration.name,
          status: integration.status,
        },
        qrCode: result.qrCode,
        message: 'Escaneie o QR Code com seu WhatsApp',
      })
    } else {
      // Cloud API - salvar credenciais diretamente
      const integration = await prisma.integration.create({
        data: {
          organizationId: ctx.organizationId,
          platform: 'WHATSAPP',
          name: data.name,
          accessToken: encrypt(data.accessToken),
          platformAccountId: data.businessAccountId,
          whatsappPhoneId: data.phoneNumberId,
          status: 'CONNECTED',
          lastSyncAt: new Date(),
        },
      })

      await createAuditLog({
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: 'integration.whatsapp_connected',
        entity: 'integration',
        entityId: integration.id,
        newData: { type: 'cloud', phoneNumberId: data.phoneNumberId },
        request: req,
      })

      return NextResponse.json({
        integration: {
          id: integration.id,
          name: integration.name,
          status: integration.status,
        },
        message: 'WhatsApp conectado com sucesso',
      })
    }
  } catch (error) {
    console.error('Erro ao configurar WhatsApp:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao configurar WhatsApp' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })

// GET - Verificar status da conexao WhatsApp (Evolution)
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const integrationId = searchParams.get('integrationId')

    if (!integrationId) {
      return NextResponse.json(
        { error: 'ID da integracao obrigatorio' },
        { status: 400 }
      )
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        organizationId: ctx.organizationId,
        platform: 'WHATSAPP',
      },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integracao nao encontrada' },
        { status: 404 }
      )
    }

    // Para Evolution API, verificar status da instancia
    if (integration.platformAccountId && !integration.whatsappPhoneId) {
      const status = await getEvolutionInstanceStatus(integration.platformAccountId)

      // Atualizar status se mudou
      if (status.connected && integration.status !== 'CONNECTED') {
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            status: 'CONNECTED',
            whatsappPhoneNumber: status.phone,
            platformAccountName: status.name,
            lastSyncAt: new Date(),
          },
        })
      }

      return NextResponse.json({
        connected: status.connected,
        phone: status.phone,
        name: status.name,
      })
    }

    // Para Cloud API, retornar status salvo
    return NextResponse.json({
      connected: integration.status === 'CONNECTED',
      phone: integration.whatsappPhoneNumber,
    })
  } catch (error) {
    console.error('Erro ao verificar status WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageIntegrations'] })
