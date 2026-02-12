// API Route: Superadmin - Organizacao individual
// PATCH - Atualizar organizacao (ativar/desativar, atribuir/remover pacotes)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

const updateOrgSchema = z.object({
  isActive: z.boolean().optional(),
  planId: z.string().optional(),
  subscriptionStatus: z.enum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE']).optional(),
  // Atribuir pacote — cria ou reativa OrganizationPackage com status ACTIVE
  assignPackageId: z.string().optional(),
  // Remover pacote — cancela OrganizationPackage
  removePackageId: z.string().optional(),
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

    // Atribuir pacote à organização
    if (data.assignPackageId) {
      const pkg = await prisma.package.findUnique({ where: { id: data.assignPackageId } })
      if (!pkg) {
        return NextResponse.json({ error: 'Pacote nao encontrado' }, { status: 404 })
      }

      // Upsert: se ja existe (mesmo cancelado), reativa; senao, cria
      await prisma.organizationPackage.upsert({
        where: {
          organizationId_packageId: {
            organizationId: id,
            packageId: data.assignPackageId,
          },
        },
        update: {
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        },
        create: {
          organizationId: id,
          packageId: data.assignPackageId,
          status: 'ACTIVE',
        },
      })

      // Buscar org atualizada com pacotes
      const updated = await prisma.organization.findUnique({
        where: { id },
        select: {
          id: true, name: true, slug: true, isActive: true, subscriptionStatus: true,
          plan: { select: { id: true, name: true } },
          packages: {
            select: {
              id: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true,
              package: { select: { id: true, name: true, slug: true, priceMonthly: true, isFree: true, isBundle: true } },
            },
          },
        },
      })

      return NextResponse.json({ organization: updated })
    }

    // Remover pacote da organização
    if (data.removePackageId) {
      // Buscar o OrganizationPackage pelo packageId
      const orgPkg = await prisma.organizationPackage.findFirst({
        where: { organizationId: id, packageId: data.removePackageId },
      })
      if (orgPkg) {
        await prisma.organizationPackage.update({
          where: { id: orgPkg.id },
          data: { status: 'CANCELED' },
        })
      }

      const updated = await prisma.organization.findUnique({
        where: { id },
        select: {
          id: true, name: true, slug: true, isActive: true, subscriptionStatus: true,
          plan: { select: { id: true, name: true } },
          packages: {
            select: {
              id: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true,
              package: { select: { id: true, name: true, slug: true, priceMonthly: true, isFree: true, isBundle: true } },
            },
          },
        },
      })

      return NextResponse.json({ organization: updated })
    }

    // Atualização geral (isActive, planId, subscriptionStatus)
    const updateData: any = {}
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.subscriptionStatus) updateData.subscriptionStatus = data.subscriptionStatus
    if (data.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: data.planId } })
      if (!plan) {
        return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 })
      }
      updateData.planId = data.planId
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, slug: true, isActive: true, subscriptionStatus: true,
        plan: { select: { id: true, name: true } },
        packages: {
          select: {
            id: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true,
            package: { select: { id: true, name: true, slug: true, priceMonthly: true, isFree: true, isBundle: true } },
          },
        },
      },
    })

    return NextResponse.json({ organization: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados invalidos', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar organizacao' }, { status: 500 })
  }
})
