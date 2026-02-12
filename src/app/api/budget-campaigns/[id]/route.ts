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
  if ('previousLeadCost' in data) updateData.previousLeadCost = data.previousLeadCost
  if ('currentLeadCost' in data) updateData.currentLeadCost = data.currentLeadCost
  if ('previousDate' in data) updateData.previousDate = data.previousDate ? new Date(data.previousDate) : null
  if ('currentDate' in data) updateData.currentDate = data.currentDate ? new Date(data.currentDate) : null
  if (data.name) updateData.name = data.name
  if (data.maxMeta != null) updateData.maxMeta = data.maxMeta
  if (data.maxGoogle != null) updateData.maxGoogle = data.maxGoogle
  if (data.dailyBudget != null) updateData.dailyBudget = data.dailyBudget
  if (data.startDate) updateData.startDate = new Date(data.startDate)

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
