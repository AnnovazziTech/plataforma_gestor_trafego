// API Route: Superadmin - Planos
// GET - Listar planos | POST - Criar plano

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

export const GET = withSuperAdmin(async (req, ctx) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { organizations: true } },
      },
    })

    return NextResponse.json({
      plans: plans.map(p => ({
        ...p,
        organizationCount: p._count.organizations,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
})

const createPlanSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  priceMonthly: z.number().min(0),
  priceYearly: z.number().min(0),
  maxUsers: z.number().int().min(1),
  maxCampaigns: z.number().int().min(1),
  maxLeads: z.number().int().min(1),
  maxIntegrations: z.number().int().min(1),
  maxCreatives: z.number().int().min(1),
  maxWhatsappNumbers: z.number().int().min(0).default(1),
  hasAiAnalysis: z.boolean().default(false),
  hasAdvancedReports: z.boolean().default(false),
  hasAutomation: z.boolean().default(false),
  hasApiAccess: z.boolean().default(false),
  hasPrioritySupport: z.boolean().default(false),
  hasWhiteLabel: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

export const POST = withSuperAdmin(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createPlanSchema.parse(body)

    // Verificar slug duplicado
    const existing = await prisma.plan.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug ja existe' }, { status: 409 })
    }

    const plan = await prisma.plan.create({ data })
    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro ao criar plano:', error)
    return NextResponse.json({ error: 'Erro ao criar plano' }, { status: 500 })
  }
})
