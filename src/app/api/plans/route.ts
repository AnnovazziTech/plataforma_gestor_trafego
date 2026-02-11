// API Route: Planos
// GET - Listar planos disponiveis

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

// GET - Listar planos (publico)
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceMonthly: true,
        priceYearly: true,
        currency: true,
        maxUsers: true,
        maxCampaigns: true,
        maxLeads: true,
        maxIntegrations: true,
        maxCreatives: true,
        maxWhatsappNumbers: true,
        hasAiAnalysis: true,
        hasAdvancedReports: true,
        hasAutomation: true,
        hasApiAccess: true,
        hasPrioritySupport: true,
        hasWhiteLabel: true,
        isFeatured: true,
      },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao listar planos' },
      { status: 500 }
    )
  }
}
