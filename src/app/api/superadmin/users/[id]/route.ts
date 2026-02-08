// API Route: Superadmin - Usuario individual
// PATCH - Ativar/desativar usuario

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
      return NextResponse.json({ error: 'ID nao fornecido' }, { status: 400 })
    }

    const body = await req.json()
    const data = updateUserSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Nao permitir desativar a si mesmo
    if (id === ctx.userId && data.isActive === false) {
      return NextResponse.json(
        { error: 'Voce nao pode desativar sua propria conta' },
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
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro ao atualizar usuario:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuario' }, { status: 500 })
  }
})
