import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const strategyId = searchParams.get('strategyId')

  const where: any = { organizationId: ctx.organizationId }
  if (clientId) where.clientId = clientId
  if (strategyId) where.strategyId = strategyId

  const campaigns = await prisma.budgetCampaign.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      strategy: { select: { id: true, name: true, totalBudget: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({ campaigns })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const data = await req.json()

  if (!data.clientId || !data.strategyId || !data.name || !data.startDate) {
    return NextResponse.json({ error: 'Cliente, estrategia, nome e data de inicio sao obrigatorios' }, { status: 400 })
  }

  const campaign = await prisma.budgetCampaign.create({
    data: {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      clientId: data.clientId,
      strategyId: data.strategyId,
      name: data.name,
      maxMeta: data.maxMeta || 0,
      maxGoogle: data.maxGoogle || 0,
      dailyBudget: data.dailyBudget || 0,
      startDate: new Date(data.startDate),
    },
    include: {
      client: { select: { id: true, name: true } },
      strategy: { select: { id: true, name: true, totalBudget: true } },
    },
  })

  return NextResponse.json({ campaign }, { status: 201 })
})
