// Middleware para API Routes
// Autenticacao, autorizacao e rate limiting

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/db/prisma'
import { hashApiKey } from '@/lib/crypto/encryption'
import { canAccessModule } from '@/lib/stripe/access-control'

export interface AuthContext {
  userId: string
  email: string
  organizationId: string
  role: string
  membership: {
    canManageCampaigns: boolean
    canManageLeads: boolean
    canManageIntegrations: boolean
    canManageBilling: boolean
    canManageMembers: boolean
    canViewReports: boolean
  }
}

type Permission = keyof AuthContext['membership']

/**
 * Wrapper para API routes com autenticacao
 */
export function withAuth(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>,
  options?: {
    requiredPermissions?: Permission[]
  }
) {
  return async (req: NextRequest) => {
    try {
      // Tentar autenticacao por JWT (NextAuth)
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

      if (token && token.id && token.organizationId) {
        // Buscar membership
        const membership = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: token.organizationId,
              userId: token.id,
            },
          },
        })

        if (!membership || !membership.isActive) {
          return NextResponse.json(
            { error: 'Acesso nao autorizado a esta organizacao' },
            { status: 403 }
          )
        }

        // Verificar permissoes
        if (options?.requiredPermissions) {
          const isOwnerOrAdmin = membership.role === 'OWNER' || membership.role === 'ADMIN'

          for (const perm of options.requiredPermissions) {
            if (!isOwnerOrAdmin && !membership[perm]) {
              return NextResponse.json(
                { error: `Permissao necessaria: ${perm}` },
                { status: 403 }
              )
            }
          }
        }

        const ctx: AuthContext = {
          userId: token.id,
          email: token.email!,
          organizationId: token.organizationId,
          role: membership.role,
          membership: {
            canManageCampaigns: membership.canManageCampaigns,
            canManageLeads: membership.canManageLeads,
            canManageIntegrations: membership.canManageIntegrations,
            canManageBilling: membership.canManageBilling,
            canManageMembers: membership.canManageMembers,
            canViewReports: membership.canViewReports,
          },
        }

        return handler(req, ctx)
      }

      // Tentar autenticacao por API Key
      const apiKey = req.headers.get('x-api-key')
      if (apiKey) {
        const keyHash = hashApiKey(apiKey)
        const key = await prisma.apiKey.findUnique({
          where: { keyHash },
          include: { organization: true },
        })

        if (!key || !key.isActive) {
          return NextResponse.json(
            { error: 'API Key invalida' },
            { status: 401 }
          )
        }

        if (key.expiresAt && key.expiresAt < new Date()) {
          return NextResponse.json(
            { error: 'API Key expirada' },
            { status: 401 }
          )
        }

        // Atualizar ultimo uso
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        })

        // API Keys tem todas as permissoes baseadas nas permissoes definidas
        const ctx: AuthContext = {
          userId: 'api-key',
          email: 'api@' + key.organization.slug,
          organizationId: key.organizationId,
          role: 'API',
          membership: {
            canManageCampaigns: key.permissions.includes('write:campaigns') || key.permissions.includes('read:campaigns'),
            canManageLeads: key.permissions.includes('write:leads') || key.permissions.includes('read:leads'),
            canManageIntegrations: key.permissions.includes('write:integrations'),
            canManageBilling: false,
            canManageMembers: false,
            canViewReports: key.permissions.includes('read:reports'),
          },
        }

        return handler(req, ctx)
      }

      return NextResponse.json(
        { error: 'Autenticacao necessaria' },
        { status: 401 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno de autenticacao' },
        { status: 500 }
      )
    }
  }
}

/**
 * Context para rotas de superadmin
 */
export interface SuperAdminContext {
  userId: string
  email: string
}

/**
 * Wrapper para API routes de superadmin
 */
export function withSuperAdmin(
  handler: (req: NextRequest, ctx: SuperAdminContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

      if (!token || !token.id) {
        return NextResponse.json(
          { error: 'Autenticacao necessaria' },
          { status: 401 }
        )
      }

      // Verificar flag de superadmin diretamente no banco
      const user = await prisma.user.findUnique({
        where: { id: token.id },
        select: { id: true, email: true, isSuperAdmin: true, isActive: true },
      })

      if (!user || !user.isActive || !user.isSuperAdmin) {
        return NextResponse.json(
          { error: 'Acesso restrito a superadministradores' },
          { status: 403 }
        )
      }

      return handler(req, { userId: user.id, email: user.email })
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno de autenticacao' },
        { status: 500 }
      )
    }
  }
}

/**
 * Verificar se organizacao pode adicionar mais recursos
 */
export async function checkResourceLimit(
  organizationId: string,
  resource: 'users' | 'campaigns' | 'leads' | 'integrations' | 'creatives'
): Promise<{ allowed: boolean; current: number; max: number; error?: string }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      plan: true,
      _count: {
        select: {
          members: true,
          campaigns: true,
          leads: true,
          integrations: true,
          creatives: true,
        },
      },
    },
  })

  if (!org) {
    return { allowed: false, current: 0, max: 0, error: 'Organizacao nao encontrada' }
  }

  const limits: Record<string, { current: number; max: number }> = {
    users: { current: org._count.members, max: org.plan.maxUsers },
    campaigns: { current: org._count.campaigns, max: org.plan.maxCampaigns },
    leads: { current: org._count.leads, max: org.plan.maxLeads },
    integrations: { current: org._count.integrations, max: org.plan.maxIntegrations },
    creatives: { current: org._count.creatives, max: org.plan.maxCreatives },
  }

  const limit = limits[resource]
  if (limit.current >= limit.max) {
    return {
      allowed: false,
      current: limit.current,
      max: limit.max,
      error: `Limite de ${resource} atingido (${limit.current}/${limit.max}). Faca upgrade do seu plano.`,
    }
  }

  return { allowed: true, current: limit.current, max: limit.max }
}

/**
 * Criar log de auditoria
 */
export async function createAuditLog(params: {
  organizationId: string
  userId?: string
  userEmail?: string
  action: string
  entity?: string
  entityId?: string
  oldData?: any
  newData?: any
  request?: NextRequest
}) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldData: params.oldData,
        newData: params.newData,
        ipAddress: params.request?.headers.get('x-forwarded-for') || params.request?.headers.get('x-real-ip'),
        userAgent: params.request?.headers.get('user-agent'),
      },
    })
  } catch (error) {
  }
}

/**
 * Wrapper para API routes que requerem acesso a um módulo específico
 */
export function withModuleAccess(
  moduleSlug: string,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>,
  options?: {
    requiredPermissions?: Permission[]
  }
) {
  return withAuth(async (req: NextRequest, ctx: AuthContext) => {
    // SuperAdmin tem acesso a todos os modulos
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (token?.isSuperAdmin) {
      return handler(req, ctx)
    }

    const hasAccess = await canAccessModule(ctx.organizationId, moduleSlug)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Faca upgrade para acessar este modulo', moduleSlug },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  }, options)
}
