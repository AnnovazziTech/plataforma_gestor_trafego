import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-strategies/')[1]?.split('?')[0]

  const strategy = await prisma.budgetStrategy.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: {
      client: { select: { id: true, name: true } },
      campaigns: true,
    },
  })

  if (!strategy) {
    return NextResponse.json({ error: 'Estrategia nao encontrada' }, { status: 404 })
  }

  return NextResponse.json({ strategy })
})

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-strategies/')[1]?.split('?')[0]
  const data = await req.json()

  const existing = await prisma.budgetStrategy.findFirst({
    where: { id, organizationId: ctx.organizationId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Estrategia nao encontrada' }, { status: 404 })
  }

  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.totalBudget != null) updateData.totalBudget = data.totalBudget

  const strategy = await prisma.budgetStrategy.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true } },
      campaigns: {
        include: {
          client: { select: { id: true, name: true } },
          strategy: { select: { id: true, name: true, totalBudget: true } },
        },
      },
    },
  })

  return NextResponse.json({ strategy })
})

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-strategies/')[1]?.split('?')[0]

  const result = await prisma.budgetStrategy.deleteMany({
    where: { id, organizationId: ctx.organizationId },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Estrategia nao encontrada' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
})
