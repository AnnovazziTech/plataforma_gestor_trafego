// Script: Criar produtos/preços na Stripe e seed de pacotes no banco
// Executar: npx tsx scripts/stripe-setup.ts

import 'dotenv/config'
import Stripe from 'stripe'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DIRECT_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
})

const adapter = new PrismaPg(pool, { schema: 'sistema_gestor' })
const prisma = new PrismaClient({ adapter })

interface PackageDefinition {
  name: string
  slug: string
  description: string
  priceMonthly: number
  modulesSlugs: string[]
  isBundle: boolean
  isFree: boolean
  sortOrder: number
}

const packages: PackageDefinition[] = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Pacote gratuito com modulos essenciais',
    priceMonthly: 0,
    modulesSlugs: ['financeiro', 'clientes', 'controle-ads', 'criativos-free', 'noticias', 'resumo', 'agenda', 'orcamento'],
    isBundle: false,
    isFree: true,
    sortOrder: 0,
  },
  {
    name: 'Ads Pro',
    slug: 'ads-pro',
    description: 'Campanhas, analytics, relatorios e automacao',
    priceMonthly: 147,
    modulesSlugs: ['campanhas', 'analytics', 'relatorios', 'automacao'],
    isBundle: false,
    isFree: false,
    sortOrder: 1,
  },
  {
    name: 'Comercial',
    slug: 'comercial',
    description: 'Prospeccao e mensagens para equipes comerciais',
    priceMonthly: 97,
    modulesSlugs: ['prospeccao', 'mensagens'],
    isBundle: false,
    isFree: false,
    sortOrder: 2,
  },
  {
    name: 'Social & Conteudo',
    slug: 'social-conteudo',
    description: 'Redes sociais, meu link e marketplace',
    priceMonthly: 67,
    modulesSlugs: ['social', 'meu-link', 'marketplace'],
    isBundle: false,
    isFree: false,
    sortOrder: 3,
  },
  {
    name: 'Conhecimento',
    slug: 'conhecimento',
    description: 'Cursos e meu pensamento',
    priceMonthly: 47,
    modulesSlugs: ['cursos', 'meu-pensamento'],
    isBundle: false,
    isFree: false,
    sortOrder: 4,
  },
  {
    name: 'Completo',
    slug: 'completo',
    description: 'Todos os modulos pagos - melhor valor',
    priceMonthly: 297,
    modulesSlugs: ['campanhas', 'analytics', 'relatorios', 'automacao', 'prospeccao', 'mensagens', 'social', 'meu-link', 'marketplace', 'cursos', 'meu-pensamento'],
    isBundle: true,
    isFree: false,
    sortOrder: 5,
  },
]

async function main() {
  console.log('Setting up Stripe products and packages...\n')

  for (const pkg of packages) {
    let stripeProductId: string | null = null
    let stripePriceId: string | null = null

    if (!pkg.isFree) {
      // Search for existing product by metadata
      const existingProducts = await stripe.products.search({
        query: `metadata['slug']:'${pkg.slug}'`,
      })

      let product: Stripe.Product

      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0]
        console.log(`  Found existing product: ${product.name} (${product.id})`)
        // Update if needed
        product = await stripe.products.update(product.id, {
          name: pkg.name,
          description: pkg.description,
        })
      } else {
        product = await stripe.products.create({
          name: pkg.name,
          description: pkg.description,
          metadata: { slug: pkg.slug },
        })
        console.log(`  Created product: ${product.name} (${product.id})`)
      }

      stripeProductId = product.id

      // Check for existing active price
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        type: 'recurring',
      })

      const matchingPrice = existingPrices.data.find(
        p => p.unit_amount === Math.round(pkg.priceMonthly * 100) && p.currency === 'brl'
      )

      if (matchingPrice) {
        stripePriceId = matchingPrice.id
        console.log(`  Found existing price: ${stripePriceId}`)
      } else {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(pkg.priceMonthly * 100),
          currency: 'brl',
          recurring: { interval: 'month' },
          metadata: { slug: pkg.slug },
        })
        stripePriceId = price.id
        console.log(`  Created price: R$${pkg.priceMonthly}/mes (${stripePriceId})`)
      }
    }

    // Upsert package in database
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {
        name: pkg.name,
        description: pkg.description,
        priceMonthly: pkg.priceMonthly,
        stripePriceId,
        stripeProductId,
        modulesSlugs: pkg.modulesSlugs,
        isBundle: pkg.isBundle,
        isFree: pkg.isFree,
        sortOrder: pkg.sortOrder,
        isActive: true,
      },
      create: {
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        priceMonthly: pkg.priceMonthly,
        stripePriceId,
        stripeProductId,
        modulesSlugs: pkg.modulesSlugs,
        isBundle: pkg.isBundle,
        isFree: pkg.isFree,
        sortOrder: pkg.sortOrder,
        isActive: true,
      },
    })

    const icon = pkg.isFree ? '✓' : '$'
    console.log(`  ${icon} ${pkg.name} (${pkg.slug}) -> DB upserted\n`)
  }

  console.log('Done! All packages configured.')
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
