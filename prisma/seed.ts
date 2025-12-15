// Seed do banco de dados
// Cria dados completos para demonstracao

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

// Criar pool de conexao PostgreSQL
const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

// Criar adapter
const adapter = new PrismaPg(pool)

// Criar PrismaClient com adapter
const prisma = new PrismaClient({ adapter })

// Helper para datas
function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('Iniciando seed completo...')

  // ==========================================
  // 1. CRIAR PLANOS
  // ==========================================
  console.log('Criando planos...')

  const plans = [
    {
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
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
  }
  console.log('Planos criados!')

  // Buscar plano Pro para usar
  const proPlan = await prisma.plan.findUnique({ where: { slug: 'pro' } })
  if (!proPlan) throw new Error('Plano Pro nao encontrado')

  // ==========================================
  // 2. CRIAR USUARIO DE TESTE
  // ==========================================
  console.log('Criando usuario de teste...')

  const passwordHash = await bcrypt.hash('Demo@123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@trafficpro.com' },
    update: {
      name: 'Usuario Demo',
      passwordHash,
      isActive: true,
    },
    create: {
      email: 'demo@trafficpro.com',
      name: 'Usuario Demo',
      passwordHash,
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log(`Usuario criado: ${user.email}`)

  // ==========================================
  // 3. CRIAR ORGANIZACAO
  // ==========================================
  console.log('Criando organizacao...')

  const organization = await prisma.organization.upsert({
    where: { slug: 'agencia-demo' },
    update: {
      name: 'Agencia Demo',
      planId: proPlan.id,
      subscriptionStatus: 'ACTIVE',
    },
    create: {
      name: 'Agencia Demo',
      slug: 'agencia-demo',
      planId: proPlan.id,
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: daysAgo(-14), // Trial por mais 14 dias
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
    },
  })
  console.log(`Organizacao criada: ${organization.name}`)

  // ==========================================
  // 4. CRIAR MEMBRO DA ORGANIZACAO (OWNER)
  // ==========================================
  console.log('Criando membro...')

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: {
      role: 'OWNER',
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: 'OWNER',
      canManageCampaigns: true,
      canManageLeads: true,
      canManageIntegrations: true,
      canManageBilling: true,
      canManageMembers: true,
      canViewReports: true,
      isActive: true,
      acceptedAt: new Date(),
    },
  })
  console.log('Membro criado!')

  // ==========================================
  // 5. CRIAR INTEGRACOES
  // ==========================================
  console.log('Criando integracoes...')

  // Integracao WhatsApp (mock)
  const whatsappIntegration = await prisma.integration.upsert({
    where: {
      organizationId_platform_platformAccountId: {
        organizationId: organization.id,
        platform: 'WHATSAPP',
        platformAccountId: 'whatsapp-demo-001',
      },
    },
    update: {
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    create: {
      organizationId: organization.id,
      platform: 'WHATSAPP',
      name: 'WhatsApp Business Demo',
      accessToken: 'mock-token-encrypted',
      platformAccountId: 'whatsapp-demo-001',
      platformAccountName: 'WhatsApp Demo',
      whatsappPhoneNumber: '+5511999999999',
      whatsappPhoneId: 'phone-id-demo',
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      isActive: true,
    },
  })

  // Integracao Meta (mock)
  const metaIntegration = await prisma.integration.upsert({
    where: {
      organizationId_platform_platformAccountId: {
        organizationId: organization.id,
        platform: 'META',
        platformAccountId: 'meta-demo-001',
      },
    },
    update: {
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    create: {
      organizationId: organization.id,
      platform: 'META',
      name: 'Meta Ads Demo',
      accessToken: 'mock-meta-token',
      platformAccountId: 'meta-demo-001',
      platformAccountName: 'Meta Business Demo',
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      isActive: true,
    },
  })

  // Integracao Google (mock)
  const googleIntegration = await prisma.integration.upsert({
    where: {
      organizationId_platform_platformAccountId: {
        organizationId: organization.id,
        platform: 'GOOGLE',
        platformAccountId: 'google-demo-001',
      },
    },
    update: {
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    create: {
      organizationId: organization.id,
      platform: 'GOOGLE',
      name: 'Google Ads Demo',
      accessToken: 'mock-google-token',
      refreshToken: 'mock-google-refresh',
      platformAccountId: 'google-demo-001',
      platformAccountName: 'Google Ads Demo',
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      isActive: true,
    },
  })

  // Integracao TikTok (mock)
  const tiktokIntegration = await prisma.integration.upsert({
    where: {
      organizationId_platform_platformAccountId: {
        organizationId: organization.id,
        platform: 'TIKTOK',
        platformAccountId: 'tiktok-demo-001',
      },
    },
    update: {
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    create: {
      organizationId: organization.id,
      platform: 'TIKTOK',
      name: 'TikTok Ads Demo',
      accessToken: 'mock-tiktok-token',
      platformAccountId: 'tiktok-demo-001',
      platformAccountName: 'TikTok Business Demo',
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      isActive: true,
    },
  })

  console.log('Integracoes criadas!')

  // ==========================================
  // 6. CRIAR CAMPANHAS
  // ==========================================
  console.log('Criando campanhas...')

  const campaignsData = [
    // Meta Ads
    {
      name: 'Black Friday 2024 - Leads',
      platform: 'META' as const,
      objective: 'LEADS' as const,
      status: 'ACTIVE' as const,
      budget: 5000,
      spent: 3847.32,
      integrationId: metaIntegration.id,
      startDate: daysAgo(30),
    },
    {
      name: 'Remarketing - Carrinho Abandonado',
      platform: 'META' as const,
      objective: 'SALES' as const,
      status: 'PAUSED' as const,
      budget: 3000,
      spent: 1234.56,
      integrationId: metaIntegration.id,
      startDate: daysAgo(45),
    },
    // Google Ads
    {
      name: 'Google Search - Marca',
      platform: 'GOOGLE' as const,
      objective: 'TRAFFIC' as const,
      status: 'ACTIVE' as const,
      budget: 2500,
      spent: 1987.45,
      integrationId: googleIntegration.id,
      startDate: daysAgo(60),
    },
    {
      name: 'Performance Max - E-commerce',
      platform: 'GOOGLE' as const,
      objective: 'SALES' as const,
      status: 'ENDED' as const,
      budget: 8000,
      spent: 7892.10,
      integrationId: googleIntegration.id,
      startDate: daysAgo(90),
      endDate: daysAgo(5),
    },
    // TikTok Ads
    {
      name: 'TikTok - Awareness Gen Z',
      platform: 'TIKTOK' as const,
      objective: 'AWARENESS' as const,
      status: 'ACTIVE' as const,
      budget: 4000,
      spent: 2156.78,
      integrationId: tiktokIntegration.id,
      startDate: daysAgo(20),
    },
    {
      name: 'TikTok - Video Views Challenge',
      platform: 'TIKTOK' as const,
      objective: 'VIDEO_VIEWS' as const,
      status: 'DRAFT' as const,
      budget: 2000,
      spent: 0,
      integrationId: tiktokIntegration.id,
      startDate: null,
    },
  ]

  const campaigns = []
  for (const campaignData of campaignsData) {
    const campaign = await prisma.campaign.upsert({
      where: {
        organizationId_platformCampaignId: {
          organizationId: organization.id,
          platformCampaignId: `platform-${campaignData.name.toLowerCase().replace(/\s+/g, '-')}`,
        },
      },
      update: {
        ...campaignData,
        lastSyncAt: new Date(),
      },
      create: {
        organizationId: organization.id,
        platformCampaignId: `platform-${campaignData.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...campaignData,
        budgetType: 'DAILY',
        lastSyncAt: new Date(),
      },
    })
    campaigns.push(campaign)
  }
  console.log(`${campaigns.length} campanhas criadas!`)

  // ==========================================
  // 7. CRIAR METRICAS DE CAMPANHA
  // ==========================================
  console.log('Criando metricas de campanha...')

  for (const campaign of campaigns) {
    const baseImpressions = randomBetween(50000, 500000)
    const baseClicks = Math.floor(baseImpressions * (randomBetween(200, 500) / 10000))
    const baseConversions = Math.floor(baseClicks * (randomBetween(100, 300) / 10000))

    // Metricas agregadas
    await prisma.campaignMetrics.upsert({
      where: {
        campaignId_periodStart_periodEnd: {
          campaignId: campaign.id,
          periodStart: daysAgo(30),
          periodEnd: new Date(),
        },
      },
      update: {},
      create: {
        campaignId: campaign.id,
        impressions: baseImpressions,
        reach: Math.floor(baseImpressions * 0.7),
        clicks: baseClicks,
        ctr: Number(((baseClicks / baseImpressions) * 100).toFixed(2)),
        cpc: Number((campaign.spent / baseClicks).toFixed(2)),
        cpm: Number(((campaign.spent / baseImpressions) * 1000).toFixed(2)),
        conversions: baseConversions,
        conversionRate: Number(((baseConversions / baseClicks) * 100).toFixed(2)),
        costPerConversion: Number((campaign.spent / Math.max(baseConversions, 1)).toFixed(2)),
        spent: campaign.spent,
        roas: Number((randomBetween(200, 450) / 100).toFixed(2)),
        frequency: Number((randomBetween(120, 180) / 100).toFixed(2)),
        videoViews: campaign.objective === 'VIDEO_VIEWS' ? Math.floor(baseImpressions * 0.3) : 0,
        videoCompletionRate: campaign.objective === 'VIDEO_VIEWS' ? randomBetween(20, 45) : 0,
        likes: randomBetween(500, 5000),
        comments: randomBetween(50, 500),
        shares: randomBetween(100, 1000),
        saves: randomBetween(50, 300),
        periodStart: daysAgo(30),
        periodEnd: new Date(),
      },
    })

    // Metricas diarias (30 dias)
    for (let i = 29; i >= 0; i--) {
      const date = daysAgo(i)
      const dailyImpressions = randomBetween(1000, 20000)
      const dailyClicks = Math.floor(dailyImpressions * (randomBetween(200, 500) / 10000))
      const dailyConversions = Math.floor(dailyClicks * (randomBetween(100, 300) / 10000))
      const dailySpent = Number((campaign.spent / 30 * (0.8 + Math.random() * 0.4)).toFixed(2))

      await prisma.campaignDailyMetrics.upsert({
        where: {
          campaignId_date: {
            campaignId: campaign.id,
            date,
          },
        },
        update: {},
        create: {
          campaignId: campaign.id,
          date,
          impressions: dailyImpressions,
          reach: Math.floor(dailyImpressions * 0.7),
          clicks: dailyClicks,
          ctr: Number(((dailyClicks / dailyImpressions) * 100).toFixed(2)),
          cpc: Number((dailySpent / Math.max(dailyClicks, 1)).toFixed(2)),
          cpm: Number(((dailySpent / dailyImpressions) * 1000).toFixed(2)),
          conversions: dailyConversions,
          spent: dailySpent,
          roas: Number((randomBetween(200, 450) / 100).toFixed(2)),
        },
      })
    }
  }
  console.log('Metricas criadas!')

  // ==========================================
  // 8. CRIAR LEADS
  // ==========================================
  console.log('Criando leads...')

  const leadNames = [
    'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'Joao Pereira',
    'Fernanda Costa', 'Lucas Almeida', 'Patricia Lima', 'Roberto Souza',
    'Juliana Martins', 'Ricardo Ferreira', 'Camila Rodrigues', 'Bruno Goncalves',
    'Amanda Ribeiro', 'Felipe Carvalho', 'Larissa Nascimento', 'Thiago Barbosa',
    'Gabriela Araujo', 'Marcelo Moraes', 'Vanessa Nunes', 'Eduardo Mendes',
  ]

  const leadStatuses = [
    { status: 'NEW' as const, count: 5 },
    { status: 'CONTACTED' as const, count: 4 },
    { status: 'QUALIFIED' as const, count: 4 },
    { status: 'PROPOSAL' as const, count: 3 },
    { status: 'NEGOTIATION' as const, count: 2 },
    { status: 'WON' as const, count: 1 },
    { status: 'LOST' as const, count: 1 },
  ]

  const leadSources = ['META_ADS', 'GOOGLE_ADS', 'WHATSAPP', 'ORGANIC', 'MANUAL'] as const

  let leadIndex = 0
  const leads = []

  for (const statusGroup of leadStatuses) {
    for (let i = 0; i < statusGroup.count; i++) {
      const name = leadNames[leadIndex]
      const firstName = name.split(' ')[0].toLowerCase()
      const phone = `5511${randomBetween(900000000, 999999999)}`

      const lead = await prisma.lead.create({
        data: {
          organizationId: organization.id,
          campaignId: campaigns[randomBetween(0, campaigns.length - 1)].id,
          name,
          email: `${firstName}${randomBetween(1, 99)}@email.com`,
          phone,
          source: leadSources[randomBetween(0, leadSources.length - 1)],
          sourceDetails: 'Campanha Demo',
          status: statusGroup.status,
          value: randomBetween(500, 5000),
          notes: `Lead de demonstracao - ${name}`,
          convertedAt: statusGroup.status === 'WON' ? daysAgo(randomBetween(1, 5)) : null,
          lostAt: statusGroup.status === 'LOST' ? daysAgo(randomBetween(1, 5)) : null,
          lostReason: statusGroup.status === 'LOST' ? 'Preco alto' : null,
          createdAt: daysAgo(randomBetween(1, 30)),
        },
      })

      // Criar historico do lead
      await prisma.leadHistory.create({
        data: {
          leadId: lead.id,
          fromStatus: null,
          toStatus: 'NEW',
          note: 'Lead criado',
          createdAt: lead.createdAt,
        },
      })

      if (statusGroup.status !== 'NEW') {
        await prisma.leadHistory.create({
          data: {
            leadId: lead.id,
            fromStatus: 'NEW',
            toStatus: statusGroup.status,
            note: `Status alterado para ${statusGroup.status}`,
            changedById: user.id,
            createdAt: daysAgo(randomBetween(0, 5)),
          },
        })
      }

      leads.push(lead)
      leadIndex++
    }
  }
  console.log(`${leads.length} leads criados!`)

  // ==========================================
  // 9. CRIAR CONVERSAS E MENSAGENS
  // ==========================================
  console.log('Criando conversas e mensagens...')

  // Criar conversas para leads com telefone
  const leadsWithPhone = leads.filter(l => l.phone).slice(0, 8)

  for (const lead of leadsWithPhone) {
    const conversation = await prisma.conversation.create({
      data: {
        organizationId: organization.id,
        integrationId: whatsappIntegration.id,
        leadId: lead.id,
        contactName: lead.name,
        contactPhone: lead.phone!,
        status: randomBetween(0, 1) === 0 ? 'OPEN' : 'RESOLVED',
        unreadCount: randomBetween(0, 3),
        lastMessageAt: daysAgo(randomBetween(0, 5)),
      },
    })

    // Criar mensagens para a conversa
    const messageTemplates = [
      { direction: 'INBOUND' as const, content: 'Ola! Vi o anuncio de voces e gostaria de mais informacoes.' },
      { direction: 'OUTBOUND' as const, content: 'Ola! Obrigado pelo contato. Como posso ajudar?' },
      { direction: 'INBOUND' as const, content: 'Quero saber sobre os precos e prazos de entrega.' },
      { direction: 'OUTBOUND' as const, content: 'Claro! Nossos precos variam de acordo com o produto. Posso enviar nosso catalogo?' },
      { direction: 'INBOUND' as const, content: 'Sim, por favor!' },
      { direction: 'OUTBOUND' as const, content: 'Enviando o catalogo agora. Qualquer duvida estou a disposicao!' },
    ]

    const numMessages = randomBetween(3, 6)
    let lastMessageContent = ''

    for (let i = 0; i < numMessages; i++) {
      const template = messageTemplates[i % messageTemplates.length]
      const messageDate = daysAgo(numMessages - i)

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: template.content,
          type: 'TEXT',
          direction: template.direction,
          status: template.direction === 'OUTBOUND' ? 'READ' : 'DELIVERED',
          senderName: template.direction === 'INBOUND' ? lead.name : 'Atendente',
          createdAt: messageDate,
        },
      })

      lastMessageContent = template.content
    }

    // Atualizar preview da ultima mensagem
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessagePreview: lastMessageContent.substring(0, 100),
        lastMessageAt: daysAgo(0),
      },
    })
  }
  console.log('Conversas e mensagens criadas!')

  // ==========================================
  // 10. CRIAR TEMPLATES DE ARTE
  // ==========================================
  console.log('Criando templates de arte...')

  const artTemplates = [
    { name: 'Lancamento de Produto - Minimalista', niche: 'ecommerce', type: 'feed', canvaUrl: 'https://canva.com/template/ecommerce-1', tags: ['lancamento', 'produto', 'minimalista'], isNew: true },
    { name: 'Promocao Flash Sale', niche: 'ecommerce', type: 'stories', canvaUrl: 'https://canva.com/template/ecommerce-2', tags: ['promocao', 'urgencia', 'sale'] },
    { name: 'Carrossel de Produtos', niche: 'ecommerce', type: 'carrossel', canvaUrl: 'https://canva.com/template/ecommerce-3', tags: ['carrossel', 'catalogo'], isPremium: true },
    { name: 'Webinar Anuncio', niche: 'infoproduto', type: 'feed', canvaUrl: 'https://canva.com/template/info-1', tags: ['webinar', 'curso', 'online'] },
    { name: 'Ebook Download', niche: 'infoproduto', type: 'stories', canvaUrl: 'https://canva.com/template/info-2', tags: ['ebook', 'lead magnet'], isNew: true },
    { name: 'Depoimento Aluno', niche: 'infoproduto', type: 'feed', canvaUrl: 'https://canva.com/template/info-3', tags: ['depoimento', 'prova social'] },
    { name: 'Orcamento Gratis', niche: 'servicos', type: 'feed', canvaUrl: 'https://canva.com/template/servico-1', tags: ['orcamento', 'servico', 'cta'] },
    { name: 'Antes e Depois', niche: 'servicos', type: 'carrossel', canvaUrl: 'https://canva.com/template/servico-2', tags: ['transformacao', 'resultado'], isPremium: true },
    { name: 'Prato do Dia', niche: 'restaurante', type: 'feed', canvaUrl: 'https://canva.com/template/food-1', tags: ['comida', 'promocao', 'restaurante'], isNew: true },
    { name: 'Menu Digital Stories', niche: 'restaurante', type: 'stories', canvaUrl: 'https://canva.com/template/food-2', tags: ['cardapio', 'menu'] },
    { name: 'Delivery Promocao', niche: 'restaurante', type: 'feed', canvaUrl: 'https://canva.com/template/food-3', tags: ['delivery', 'ifood', 'desconto'] },
    { name: 'Nova Colecao', niche: 'moda', type: 'feed', canvaUrl: 'https://canva.com/template/fashion-1', tags: ['colecao', 'lancamento', 'moda'] },
    { name: 'Lookbook Stories', niche: 'moda', type: 'stories', canvaUrl: 'https://canva.com/template/fashion-2', tags: ['lookbook', 'outfit'], isPremium: true },
    { name: 'Sale Sazonal', niche: 'moda', type: 'feed', canvaUrl: 'https://canva.com/template/fashion-3', tags: ['sale', 'liquidacao'] },
    { name: 'Treino da Semana', niche: 'fitness', type: 'feed', canvaUrl: 'https://canva.com/template/fitness-1', tags: ['treino', 'academia', 'workout'] },
    { name: 'Transformacao Fisica', niche: 'fitness', type: 'carrossel', canvaUrl: 'https://canva.com/template/fitness-2', tags: ['antes depois', 'resultado'], isNew: true },
    { name: 'Plano de Treino', niche: 'fitness', type: 'stories', canvaUrl: 'https://canva.com/template/fitness-3', tags: ['plano', 'personal'] },
    { name: 'Matriculas Abertas', niche: 'educacao', type: 'feed', canvaUrl: 'https://canva.com/template/edu-1', tags: ['matricula', 'escola', 'curso'] },
    { name: 'Aula Experimental', niche: 'educacao', type: 'stories', canvaUrl: 'https://canva.com/template/edu-2', tags: ['aula gratis', 'trial'] },
    { name: 'Imovel Destaque', niche: 'imobiliaria', type: 'feed', canvaUrl: 'https://canva.com/template/imob-1', tags: ['imovel', 'venda', 'casa'], isPremium: true },
    { name: 'Tour Virtual', niche: 'imobiliaria', type: 'reels', canvaUrl: 'https://canva.com/template/imob-2', tags: ['tour', 'video', 'apartamento'] },
    { name: 'Agendamento Online', niche: 'saude', type: 'feed', canvaUrl: 'https://canva.com/template/saude-1', tags: ['consulta', 'medico', 'agendamento'] },
    { name: 'Dicas de Saude', niche: 'saude', type: 'carrossel', canvaUrl: 'https://canva.com/template/saude-2', tags: ['dicas', 'saude', 'bem-estar'], isNew: true },
  ]

  for (const template of artTemplates) {
    const existing = await prisma.artTemplate.findFirst({
      where: { name: template.name, niche: template.niche },
    })

    if (!existing) {
      await prisma.artTemplate.create({
        data: {
          ...template,
          downloads: randomBetween(500, 3500),
          rating: Number((4 + Math.random()).toFixed(1)),
          ratingCount: randomBetween(20, 200),
        },
      })
    }
  }
  console.log('Templates de arte criados!')

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log('\n========================================')
  console.log('SEED COMPLETO!')
  console.log('========================================')
  console.log(`Email: demo@trafficpro.com`)
  console.log(`Senha: Demo@123`)
  console.log(`Organizacao: ${organization.name}`)
  console.log(`Plano: ${proPlan.name}`)
  console.log(`Campanhas: ${campaigns.length}`)
  console.log(`Leads: ${leads.length}`)
  console.log(`Conversas: ${leadsWithPhone.length}`)
  console.log('========================================\n')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
