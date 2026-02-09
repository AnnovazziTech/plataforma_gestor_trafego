// API Route: Registro de Usuario
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { sendConversionEvent, extractClientIp, extractUserAgent } from '@/lib/meta/conversions-api'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  organizationName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados
    const validatedData = registerSchema.parse(body)

    // Verificar se email ja existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ja esta cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(validatedData.password, 12)

    // Buscar plano gratuito/trial
    let starterPlan = await prisma.plan.findFirst({
      where: { slug: 'starter' },
    })

    // Se nao existir, criar planos padrao
    if (!starterPlan) {
      starterPlan = await prisma.plan.create({
        data: {
          name: 'Starter',
          slug: 'starter',
          description: 'Plano inicial gratuito para comecar',
          priceMonthly: 0,
          priceYearly: 0,
          maxUsers: 1,
          maxCampaigns: 5,
          maxLeads: 100,
          maxIntegrations: 1,
          maxCreatives: 20,
          maxWhatsappNumbers: 1,
          hasAiAnalysis: false,
          hasAdvancedReports: false,
          hasAutomation: false,
          hasApiAccess: false,
          hasPrioritySupport: false,
          hasWhiteLabel: false,
          sortOrder: 0,
        },
      })

      // Criar outros planos
      await prisma.plan.createMany({
        data: [
          {
            name: 'Pro',
            slug: 'pro',
            description: 'Para profissionais e pequenas equipes',
            priceMonthly: 197,
            priceYearly: 1970,
            maxUsers: 5,
            maxCampaigns: 50,
            maxLeads: 2000,
            maxIntegrations: 5,
            maxCreatives: 500,
            maxWhatsappNumbers: 3,
            hasAiAnalysis: true,
            hasAdvancedReports: true,
            hasAutomation: true,
            hasApiAccess: false,
            hasPrioritySupport: false,
            hasWhiteLabel: false,
            isFeatured: true,
            sortOrder: 1,
          },
          {
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'Para agencias e grandes equipes',
            priceMonthly: 497,
            priceYearly: 4970,
            maxUsers: 20,
            maxCampaigns: 500,
            maxLeads: 50000,
            maxIntegrations: 20,
            maxCreatives: 5000,
            maxWhatsappNumbers: 10,
            hasAiAnalysis: true,
            hasAdvancedReports: true,
            hasAutomation: true,
            hasApiAccess: true,
            hasPrioritySupport: true,
            hasWhiteLabel: true,
            sortOrder: 2,
          },
        ],
      })
    }

    // Criar usuario e organizacao em uma transacao
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuario
      const user = await tx.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          name: validatedData.name,
          passwordHash,
        },
      })

      // Criar organizacao se nome foi fornecido
      if (validatedData.organizationName) {
        // Gerar slug unico
        let baseSlug = validatedData.organizationName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        let slug = baseSlug
        let counter = 1
        while (await tx.organization.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`
          counter++
        }

        const organization = await tx.organization.create({
          data: {
            name: validatedData.organizationName,
            slug,
            planId: starterPlan!.id,
            subscriptionStatus: 'TRIALING',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
          },
        })

        // Adicionar usuario como owner
        await tx.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: 'OWNER',
            canManageCampaigns: true,
            canManageLeads: true,
            canManageIntegrations: true,
            canManageBilling: true,
            canManageMembers: true,
            canViewReports: true,
            acceptedAt: new Date(),
          },
        })

        return { user, organization }
      }

      return { user, organization: null }
    })

    // Meta Conversions API: CompleteRegistration
    sendConversionEvent({
      event_name: 'CompleteRegistration',
      user_data: {
        em: validatedData.email,
        client_ip_address: extractClientIp(request),
        client_user_agent: extractUserAgent(request),
      },
      custom_data: {
        content_name: 'Registro TrafficPro',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: result.organization
        ? {
            id: result.organization.id,
            slug: result.organization.slug,
            name: result.organization.name,
          }
        : null,
    })
  } catch (error) {
    console.error('Erro no registro:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
