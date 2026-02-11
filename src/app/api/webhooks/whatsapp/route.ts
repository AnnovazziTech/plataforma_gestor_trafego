// API Route: Webhook do WhatsApp
// Recebe mensagens de Evolution API e Cloud API

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db/prisma'
import { parseWhatsAppWebhook, formatPhoneNumber } from '@/lib/integrations/whatsapp'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/api/rate-limit'

function verifyWhatsAppSignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) return false
  if (!signature) return false

  const expectedSig = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')

  const sig = signature.replace('sha256=', '')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  } catch {
    return false
  }
}

// GET - Verificacao do webhook (WhatsApp Cloud API)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verificar token (obrigatorio via env var)
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  if (!verifyToken) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST - Receber mensagens
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req)
    const rl = checkRateLimit(`webhook-wa:${ip}`, RATE_LIMITS.webhook)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const rawBody = await req.text()

    // Validar assinatura HMAC se META_APP_SECRET configurado (Cloud API)
    const signature = req.headers.get('x-hub-signature-256')
    if (process.env.META_APP_SECRET) {
      if (!verifyWhatsAppSignature(rawBody, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    const body = JSON.parse(rawBody)
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

  } catch (error) {
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
