import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-campaigns/')[1]?.split('?')[0]
  const data = await req.json()

  const existing = await prisma.budgetCampaign.findFirst({
    where: { id, organizationId: ctx.organizationId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Campanha nao encontrada' }, { status: 404 })
  }

  const updateData: any = {}
  if (data.spentMeta != null) updateData.spentMeta = data.spentMeta
  if (data.spentGoogle != null) updateData.spentGoogle = data.spentGoogle
  if (data.previousLeadCost != null) updateData.previousLeadCost = data.previousLeadCost
  if (data.currentLeadCost != null) updateData.currentLeadCost = data.currentLeadCost
  if (data.previousDate) updateData.previousDate = new Date(data.previousDate)
  if (data.currentDate) updateData.currentDate = new Date(data.currentDate)
  if (data.name) updateData.name = data.name
  if (data.maxMeta != null) updateData.maxMeta = data.maxMeta
  if (data.maxGoogle != null) updateData.maxGoogle = data.maxGoogle
  if (data.dailyBudget != null) updateData.dailyBudget = data.dailyBudget

  const campaign = await prisma.budgetCampaign.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true } },
      strategy: { select: { id: true, name: true, totalBudget: true } },
    },
  })

  return NextResponse.json({ campaign })
})

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-campaigns/')[1]?.split('?')[0]

  const result = await prisma.budgetCampaign.deleteMany({
    where: { id, organizationId: ctx.organizationId },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Campanha nao encontrada' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
})
