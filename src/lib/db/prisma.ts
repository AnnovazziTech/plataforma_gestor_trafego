// Prisma Client Singleton for Prisma 7
// Usa pg adapter para conexao com PostgreSQL

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient() {
  // Usar DATABASE_URL para conexao via pooler
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL nao configurado')
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  })
  const adapter = new PrismaPg(pool, {
    schema: 'sistema_gestor',
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
