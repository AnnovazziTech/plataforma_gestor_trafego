// Helpers para sessao e autorizacao
// Usar em Server Components e API Routes

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './config'
import prisma from '@/lib/db/prisma'

/**
 * Obter sessao atual do usuario
 * Usar em Server Components
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Obter sessao ou redirecionar para login
 * Usar em paginas protegidas
 */
export async function requireSession() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Obter sessao com organizacao ou redirecionar
 * Usar em paginas que precisam de organizacao
 */
export async function requireOrganization() {
  const session = await requireSession()

  if (!session.user.organizationId) {
    redirect('/onboarding')
  }

  return session
}

/**
 * Verificar se usuario tem permissao especifica
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  permission: 'canManageCampaigns' | 'canManageLeads' | 'canManageIntegrations' | 'canManageBilling' | 'canManageMembers' | 'canViewReports'
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  })

  if (!membership || !membership.isActive) {
    return false
  }

  // Owner e Admin tem todas as permissoes
  if (membership.role === 'OWNER' || membership.role === 'ADMIN') {
    return true
  }

  return membership[permission] === true
}

/**
 * Verificar se usuario pertence a organizacao
 */
export async function isMemberOf(userId: string, organizationId: string): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  })

  return membership?.isActive === true
}

/**
 * Obter organizacao atual do usuario com verificacao de limites
 */
export async function getOrganizationWithLimits(organizationId: string) {
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

  if (!org) return null

  return {
    ...org,
    limits: {
      users: { current: org._count.members, max: org.plan.maxUsers },
      campaigns: { current: org._count.campaigns, max: org.plan.maxCampaigns },
      leads: { current: org._count.leads, max: org.plan.maxLeads },
      integrations: { current: org._count.integrations, max: org.plan.maxIntegrations },
      creatives: { current: org._count.creatives, max: org.plan.maxCreatives },
    },
    features: {
      aiAnalysis: org.plan.hasAiAnalysis,
      advancedReports: org.plan.hasAdvancedReports,
      automation: org.plan.hasAutomation,
      apiAccess: org.plan.hasApiAccess,
      prioritySupport: org.plan.hasPrioritySupport,
      whiteLabel: org.plan.hasWhiteLabel,
    },
  }
}

/**
 * Verificar se organizacao pode adicionar mais de algo
 */
export async function canAddMore(
  organizationId: string,
  resource: 'users' | 'campaigns' | 'leads' | 'integrations' | 'creatives'
): Promise<{ allowed: boolean; current: number; max: number }> {
  const org = await getOrganizationWithLimits(organizationId)

  if (!org) {
    return { allowed: false, current: 0, max: 0 }
  }

  const limit = org.limits[resource]
  return {
    allowed: limit.current < limit.max,
    current: limit.current,
    max: limit.max,
  }
}
