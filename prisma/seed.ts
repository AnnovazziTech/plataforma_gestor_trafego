// Seed do banco de dados
// Cria planos iniciais e templates de arte

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'

// Criar pool de conexao PostgreSQL
const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

// Criar adapter
const adapter = new PrismaPg(pool)

// Criar PrismaClient com adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed...')

  // Criar planos
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

  // Criar templates de arte
  const artTemplates = [
    // E-commerce
    { name: 'Lancamento de Produto - Minimalista', niche: 'ecommerce', type: 'feed', canvaUrl: 'https://canva.com/template/ecommerce-1', tags: ['lancamento', 'produto', 'minimalista'], isNew: true },
    { name: 'Promocao Flash Sale', niche: 'ecommerce', type: 'stories', canvaUrl: 'https://canva.com/template/ecommerce-2', tags: ['promocao', 'urgencia', 'sale'] },
    { name: 'Carrossel de Produtos', niche: 'ecommerce', type: 'carrossel', canvaUrl: 'https://canva.com/template/ecommerce-3', tags: ['carrossel', 'catalogo'], isPremium: true },

    // Infoproduto
    { name: 'Webinar Anuncio', niche: 'infoproduto', type: 'feed', canvaUrl: 'https://canva.com/template/info-1', tags: ['webinar', 'curso', 'online'] },
    { name: 'Ebook Download', niche: 'infoproduto', type: 'stories', canvaUrl: 'https://canva.com/template/info-2', tags: ['ebook', 'lead magnet'], isNew: true },
    { name: 'Depoimento Aluno', niche: 'infoproduto', type: 'feed', canvaUrl: 'https://canva.com/template/info-3', tags: ['depoimento', 'prova social'] },

    // Servicos
    { name: 'Orcamento Gratis', niche: 'servicos', type: 'feed', canvaUrl: 'https://canva.com/template/servico-1', tags: ['orcamento', 'servico', 'cta'] },
    { name: 'Antes e Depois', niche: 'servicos', type: 'carrossel', canvaUrl: 'https://canva.com/template/servico-2', tags: ['transformacao', 'resultado'], isPremium: true },

    // Restaurante
    { name: 'Prato do Dia', niche: 'restaurante', type: 'feed', canvaUrl: 'https://canva.com/template/food-1', tags: ['comida', 'promocao', 'restaurante'], isNew: true },
    { name: 'Menu Digital Stories', niche: 'restaurante', type: 'stories', canvaUrl: 'https://canva.com/template/food-2', tags: ['cardapio', 'menu'] },
    { name: 'Delivery Promocao', niche: 'restaurante', type: 'feed', canvaUrl: 'https://canva.com/template/food-3', tags: ['delivery', 'ifood', 'desconto'] },

    // Moda
    { name: 'Nova Colecao', niche: 'moda', type: 'feed', canvaUrl: 'https://canva.com/template/fashion-1', tags: ['colecao', 'lancamento', 'moda'] },
    { name: 'Lookbook Stories', niche: 'moda', type: 'stories', canvaUrl: 'https://canva.com/template/fashion-2', tags: ['lookbook', 'outfit'], isPremium: true },
    { name: 'Sale Sazonal', niche: 'moda', type: 'feed', canvaUrl: 'https://canva.com/template/fashion-3', tags: ['sale', 'liquidacao'] },

    // Fitness
    { name: 'Treino da Semana', niche: 'fitness', type: 'feed', canvaUrl: 'https://canva.com/template/fitness-1', tags: ['treino', 'academia', 'workout'] },
    { name: 'Transformacao Fisica', niche: 'fitness', type: 'carrossel', canvaUrl: 'https://canva.com/template/fitness-2', tags: ['antes depois', 'resultado'], isNew: true },
    { name: 'Plano de Treino', niche: 'fitness', type: 'stories', canvaUrl: 'https://canva.com/template/fitness-3', tags: ['plano', 'personal'] },

    // Educacao
    { name: 'Matriculas Abertas', niche: 'educacao', type: 'feed', canvaUrl: 'https://canva.com/template/edu-1', tags: ['matricula', 'escola', 'curso'] },
    { name: 'Aula Experimental', niche: 'educacao', type: 'stories', canvaUrl: 'https://canva.com/template/edu-2', tags: ['aula gratis', 'trial'] },

    // Imobiliaria
    { name: 'Imovel Destaque', niche: 'imobiliaria', type: 'feed', canvaUrl: 'https://canva.com/template/imob-1', tags: ['imovel', 'venda', 'casa'], isPremium: true },
    { name: 'Tour Virtual', niche: 'imobiliaria', type: 'reels', canvaUrl: 'https://canva.com/template/imob-2', tags: ['tour', 'video', 'apartamento'] },

    // Saude
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
          downloads: Math.floor(Math.random() * 3000) + 500,
          rating: 4 + Math.random() * 1,
          ratingCount: Math.floor(Math.random() * 200) + 20,
        },
      })
    }
  }

  console.log('Templates de arte criados!')

  console.log('Seed concluido!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
