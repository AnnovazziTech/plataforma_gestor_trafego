// API Route: Superadmin - Usuário individual
// PATCH - Ativar/desativar usuário

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
})

export const PATCH = withSuperAdmin(async (req, ctx) => {
  try {
    const id = req.url.split('/users/')[1]?.split('?')[0]
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    const body = await req.json()
    const data = updateUserSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Não permitir desativar a si mesmo
    if (id === ctx.userId && data.isActive === false) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, isActive: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
})
