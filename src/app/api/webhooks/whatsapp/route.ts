// API Route: Webhook do WhatsApp
// Recebe mensagens de Evolution API e Cloud API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { parseWhatsAppWebhook, formatPhoneNumber } from '@/lib/integrations/whatsapp'

// GET - Verificacao do webhook (WhatsApp Cloud API)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verificar token
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'trafficpro-webhook'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook WhatsApp verificado')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST - Receber mensagens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = parseWhatsAppWebhook(body)

    if (parsed.type === 'unknown') {
      return NextResponse.json({ received: true })
    }

    // Processar mensagem recebida
    if (parsed.type === 'message') {
      await processIncomingMessage(parsed.data)
    }

    // Processar atualizacao de status
    if (parsed.type === 'status') {
      await processStatusUpdate(parsed.data)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function processIncomingMessage(data: any) {
  try {
    let phone: string
    let messageContent: string
    let messageType: string
    let messageId: string
    let senderName: string | undefined
    let instanceName: string | undefined

    // Evolution API format
    if (data.key) {
      phone = data.key.remoteJid?.replace('@s.whatsapp.net', '') || ''
      messageContent = data.message?.conversation ||
        data.message?.extendedTextMessage?.text ||
        data.message?.imageMessage?.caption ||
        '[Midia]'
      messageType = getMessageTypeFromEvolution(data.message)
      messageId = data.key.id
      senderName = data.pushName
      instanceName = data.instance
    }
    // Cloud API format
    else if (data.messages) {
      const msg = data.messages[0]
      phone = msg.from
      messageContent = msg.text?.body || msg.caption || '[Midia]'
      messageType = msg.type?.toUpperCase() || 'TEXT'
      messageId = msg.id
      senderName = data.contacts?.[0]?.profile?.name
    } else {
      return
    }

    if (!phone) return

    const formattedPhone = formatPhoneNumber(phone)

    // Buscar integracao correspondente
    let integration

    if (instanceName) {
      // Evolution API - buscar por nome da instancia
      integration = await prisma.integration.findFirst({
        where: {
          platformAccountId: instanceName,
          platform: 'WHATSAPP',
          status: 'CONNECTED',
        },
      })
    } else {
      // Cloud API - buscar por phoneNumberId
      integration = await prisma.integration.findFirst({
        where: {
          platform: 'WHATSAPP',
          status: 'CONNECTED',
          // Pode precisar ajustar para identificar corretamente
        },
      })
    }

    if (!integration) {
      console.log('Integracao WhatsApp nao encontrada para:', instanceName || 'cloud')
      return
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        organizationId: integration.organizationId,
        integrationId: integration.id,
        contactPhone: formattedPhone,
      },
    })

    if (!conversation) {
      // Criar nova conversa
      conversation = await prisma.conversation.create({
        data: {
          organizationId: integration.organizationId,
          integrationId: integration.id,
          contactPhone: formattedPhone,
          contactName: senderName || formattedPhone,
          status: 'OPEN',
          unreadCount: 1,
          lastMessageAt: new Date(),
          lastMessagePreview: messageContent.substring(0, 100),
        },
      })

      // Tentar vincular a um lead existente pelo telefone
      const lead = await prisma.lead.findFirst({
        where: {
          organizationId: integration.organizationId,
          phone: { contains: formattedPhone.slice(-9) }, // Ultimos 9 digitos
        },
      })

      if (lead) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { leadId: lead.id },
        })
      }
    } else {
      // Atualizar conversa existente
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          unreadCount: { increment: 1 },
          lastMessageAt: new Date(),
          lastMessagePreview: messageContent.substring(0, 100),
          status: 'OPEN',
          contactName: senderName || conversation.contactName,
        },
      })
    }

    // Salvar mensagem
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        platformMessageId: messageId,
        content: messageContent,
        type: messageType as any,
        direction: 'INBOUND',
        status: 'DELIVERED',
        senderName,
      },
    })

    console.log(`Mensagem recebida de ${formattedPhone} na org ${integration.organizationId}`)
  } catch (error) {
    console.error('Erro ao processar mensagem:', error)
  }
}

async function processStatusUpdate(data: any) {
  try {
    // Array de status (Cloud API)
    const statuses = Array.isArray(data) ? data : [data]

    for (const status of statuses) {
      const messageId = status.id
      const newStatus = mapWhatsAppStatus(status.status)

      if (messageId && newStatus) {
        await prisma.message.updateMany({
          where: { platformMessageId: messageId },
          data: { status: newStatus },
        })
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
  }
}

function getMessageTypeFromEvolution(message: any): string {
  if (message?.conversation || message?.extendedTextMessage) return 'TEXT'
  if (message?.imageMessage) return 'IMAGE'
  if (message?.videoMessage) return 'VIDEO'
  if (message?.audioMessage) return 'AUDIO'
  if (message?.documentMessage) return 'DOCUMENT'
  if (message?.locationMessage) return 'LOCATION'
  if (message?.contactMessage) return 'CONTACT'
  if (message?.stickerMessage) return 'STICKER'
  return 'TEXT'
}

type MessageStatusType = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

function mapWhatsAppStatus(status: string): MessageStatusType | null {
  const mapping: Record<string, MessageStatusType> = {
    sent: 'SENT',
    delivered: 'DELIVERED',
    read: 'READ',
    failed: 'FAILED',
  }
  return mapping[status?.toLowerCase()] || null
}
