// API Route: Perfil do Usuario
// GET - Buscar perfil
// PATCH - Atualizar perfil

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'
import bcrypt from 'bcryptjs'

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  notificationPrefs: z.record(z.string(), z.boolean()).optional(),
  organizationName: z.string().min(1).optional(),
  organizationWebsite: z.string().nullable().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatoria'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
})

// GET - Buscar perfil
export const GET = withAuth(async (req, ctx) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        emailVerified: true,
        notificationPrefs: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario nao encontrado' },
        { status: 404 }
      )
    }

    // Buscar organizacao atual
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            website: true,
            plan: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    // Contar organizacoes do usuario
    const organizationCount = await prisma.organizationMember.count({
      where: {
        userId: ctx.userId,
        isActive: true,
      },
    })

    // Buscar sessoes ativas
    const sessions = await prisma.session.findMany({
      where: {
        userId: ctx.userId,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        expires: true,
      },
      orderBy: { expires: 'desc' },
    })

    return NextResponse.json({
      user,
      currentOrganization: membership?.organization,
      role: membership?.role,
      permissions: {
        canManageCampaigns: membership?.canManageCampaigns,
        canManageLeads: membership?.canManageLeads,
        canManageIntegrations: membership?.canManageIntegrations,
        canManageBilling: membership?.canManageBilling,
        canManageMembers: membership?.canManageMembers,
        canViewReports: membership?.canViewReports,
      },
      organizationCount,
      sessions,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
})

// PATCH - Atualizar perfil
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()

    // Verificar se e alteracao de senha
    if (body.currentPassword && body.newPassword) {
      const passwordData = changePasswordSchema.parse(body)

      // Buscar usuario com hash da senha
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
      })

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: 'Usuario nao encontrado ou sem senha definida' },
          { status: 400 }
        )
      }

      // Verificar senha atual
      const isValid = await bcrypt.compare(passwordData.currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 }
        )
      }

      // Atualizar senha
      const newHash = await bcrypt.hash(passwordData.newPassword, 12)
      await prisma.user.update({
        where: { id: ctx.userId },
        data: { passwordHash: newHash },
      })

      await createAuditLog({
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: 'user.password_changed',
        entity: 'user',
        entityId: ctx.userId,
        request: req,
      })

      return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' })
    }

    // Atualizar dados do perfil
    const data = updateProfileSchema.parse(body)

    // Separar campos do user e da organization
    const { organizationName, organizationWebsite, notificationPrefs, ...userData } = data

    const user = await prisma.user.update({
      where: { id: ctx.userId },
      data: {
        ...userData,
        ...(notificationPrefs !== undefined ? { notificationPrefs } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        notificationPrefs: true,
      },
    })

    // Atualizar organization se OWNER ou ADMIN
    if (organizationName !== undefined || organizationWebsite !== undefined) {
      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId: ctx.userId,
          organizationId: ctx.organizationId,
          isActive: true,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (membership) {
        await prisma.organization.update({
          where: { id: ctx.organizationId },
          data: {
            ...(organizationName !== undefined ? { name: organizationName } : {}),
            ...(organizationWebsite !== undefined ? { website: organizationWebsite } : {}),
          },
        })
      }
    }

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'user.profile_updated',
      entity: 'user',
      entityId: ctx.userId,
      newData: data,
      request: req,
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
})
