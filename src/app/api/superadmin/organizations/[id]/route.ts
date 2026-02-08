// API Route: Superadmin - Organizacao individual
// PATCH - Atualizar organizacao (ativar/desativar, trocar plano)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

const updateOrgSchema = z.object({
  isActive: z.boolean().optional(),
  planId: z.string().optional(),
  subscriptionStatus: z.enum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE']).optional(),
})

export const PATCH = withSuperAdmin(async (req, ctx) => {
  try {
    const id = req.url.split('/organizations/')[1]?.split('?')[0]
    if (!id) {
      return NextResponse.json({ error: 'ID nao fornecido' }, { status: 400 })
    }

    const body = await req.json()
    const data = updateOrgSchema.parse(body)

    const org = await prisma.organization.findUnique({ where: { id } })
    if (!org) {
      return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 })
    }

    // Se trocar plano, verificar se existe
    if (data.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: data.planId } })
      if (!plan) {
        return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 })
      }
    }

    const updated = await prisma.organization.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        subscriptionStatus: true,
        plan: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ organization: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro ao atualizar organizacao:', error)
    return NextResponse.json({ error: 'Erro ao atualizar organizacao' }, { status: 500 })
  }
})
