// API Route: Mensagens de uma conversa
// GET - Listar mensagens

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

// GET - Listar mensagens de uma conversa
export const GET = withAuth(async (
  req: NextRequest,
  ctx
) => {
  try {
    // Extrair ID da URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const conversationId = pathParts[pathParts.indexOf('conversations') + 1]

    const { searchParams } = url
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Verificar se conversa pertence a organizacao
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        organizationId: ctx.organizationId,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa nao encontrada' },
        { status: 404 }
      )
    }

    // Buscar mensagens
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ])

    // Marcar como lidas se houver mensagens nao lidas
    if (conversation.unreadCount > 0) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      })
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        contactName: conversation.contactName,
        contactPhone: conversation.contactPhone,
        status: conversation.status,
      },
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro ao listar mensagens' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageLeads'] })
