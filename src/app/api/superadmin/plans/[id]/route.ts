// API Route: Superadmin - Plano individual
// PATCH - Atualizar plano

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceMonthly: z.number().min(0).optional(),
  priceYearly: z.number().min(0).optional(),
  maxUsers: z.number().int().min(1).optional(),
  maxCampaigns: z.number().int().min(1).optional(),
  maxLeads: z.number().int().min(1).optional(),
  maxIntegrations: z.number().int().min(1).optional(),
  maxCreatives: z.number().int().min(1).optional(),
  maxWhatsappNumbers: z.number().int().min(0).optional(),
  hasAiAnalysis: z.boolean().optional(),
  hasAdvancedReports: z.boolean().optional(),
  hasAutomation: z.boolean().optional(),
  hasApiAccess: z.boolean().optional(),
  hasPrioritySupport: z.boolean().optional(),
  hasWhiteLabel: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export const PATCH = withSuperAdmin(async (req, ctx) => {
  try {
    const id = req.url.split('/plans/')[1]?.split('?')[0]
    if (!id) {
      return NextResponse.json({ error: 'ID nao fornecido' }, { status: 400 })
    }

    const body = await req.json()
    const data = updatePlanSchema.parse(body)

    const existing = await prisma.plan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 })
    }

    const plan = await prisma.plan.update({
      where: { id },
      data,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
  }
})
