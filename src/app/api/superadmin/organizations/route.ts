// API Route: Superadmin - Organizacoes
// GET - Listar todas as organizacoes

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

export const GET = withSuperAdmin(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const planId = searchParams.get('planId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.subscriptionStatus = status
    if (planId) where.planId = planId

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          isActive: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          createdAt: true,
          plan: { select: { id: true, name: true, priceMonthly: true } },
          _count: {
            select: {
              members: true,
              campaigns: true,
              leads: true,
              integrations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ])

    return NextResponse.json({
      organizations: organizations.map(org => ({
        ...org,
        membersCount: org._count.members,
        campaignsCount: org._count.campaigns,
        leadsCount: org._count.leads,
        integrationsCount: org._count.integrations,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Erro ao buscar organizacoes:', error)
    return NextResponse.json({ error: 'Erro ao buscar organizacoes' }, { status: 500 })
  }
})
