import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  const where: any = { organizationId: ctx.organizationId }
  if (clientId) where.clientId = clientId

  const strategies = await prisma.budgetStrategy.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      campaigns: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ strategies })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const data = await req.json()

  if (!data.clientId || !data.name || data.totalBudget == null) {
    return NextResponse.json({ error: 'Cliente, nome e orcamento total sao obrigatorios' }, { status: 400 })
  }

  const strategy = await prisma.budgetStrategy.create({
    data: {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      clientId: data.clientId,
      name: data.name,
      totalBudget: data.totalBudget,
    },
    include: {
      client: { select: { id: true, name: true } },
      campaigns: true,
    },
  })

  return NextResponse.json({ strategy }, { status: 201 })
})
