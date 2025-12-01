// API Route: Conversas (CRM WhatsApp)
// GET - Listar conversas
// POST - Enviar mensagem

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'
import { decrypt } from '@/lib/crypto/encryption'
import {
  sendEvolutionMessage,
  sendCloudMessage,
  formatPhoneNumber,
} from '@/lib/integrations/whatsapp'

// GET - Listar conversas
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const integrationId = searchParams.get('integrationId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId: ctx.organizationId,
      isActive: true,
    }

    if (integrationId) {
      where.integrationId = integrationId
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Buscar conversas
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          integration: {
            select: {
              id: true,
              name: true,
              whatsappPhoneNumber: true,
            },
          },
          lead: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ])

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar conversas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar conversas' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })

// POST - Enviar mensagem
const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  integrationId: z.string(),
  to: z.string().min(1, 'Numero de destino obrigatorio'),
  message: z.string().min(1, 'Mensagem obrigatoria'),
  leadId: z.string().optional(),
})

export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = sendMessageSchema.parse(body)

    // Buscar integracao
    const integration = await prisma.integration.findFirst({
      where: {
        id: data.integrationId,
        organizationId: ctx.organizationId,
        platform: 'WHATSAPP',
        status: 'CONNECTED',
      },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integracao WhatsApp nao encontrada ou nao conectada' },
        { status: 400 }
      )
    }

    // Formatar numero
    const formattedPhone = formatPhoneNumber(data.to)

    // Enviar mensagem baseado no tipo de integracao
    let result: { success: boolean; messageId?: string; error?: string }

    if (integration.whatsappPhoneId) {
      // Cloud API
      const accessToken = decrypt(integration.accessToken)
      result = await sendCloudMessage(
        integration.whatsappPhoneId,
        accessToken,
        formattedPhone,
        data.message
      )
    } else if (integration.platformAccountId) {
      // Evolution API
      result = await sendEvolutionMessage(
        integration.platformAccountId,
        formattedPhone,
        data.message
      )
    } else {
      return NextResponse.json(
        { error: 'Configuracao de WhatsApp invalida' },
        { status: 400 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao enviar mensagem' },
        { status: 400 }
      )
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        organizationId: ctx.organizationId,
        integrationId: data.integrationId,
        contactPhone: formattedPhone,
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          organizationId: ctx.organizationId,
          integrationId: data.integrationId,
          contactPhone: formattedPhone,
          contactName: data.to,
          leadId: data.leadId,
          status: 'OPEN',
          lastMessageAt: new Date(),
          lastMessagePreview: data.message.substring(0, 100),
        },
      })
    } else {
      // Atualizar conversa
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: data.message.substring(0, 100),
          status: 'OPEN',
        },
      })
    }

    // Salvar mensagem enviada
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        platformMessageId: result.messageId,
        content: data.message,
        type: 'TEXT',
        direction: 'OUTBOUND',
        status: 'SENT',
        senderId: ctx.userId,
      },
    })

    return NextResponse.json({
      success: true,
      message,
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })
