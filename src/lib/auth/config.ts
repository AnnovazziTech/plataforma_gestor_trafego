// NextAuth Configuration
// Autenticação com credenciais + OAuth providers

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db/prisma'

// Estender tipos do NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      avatar?: string | null
      organizationId?: string
      organizationSlug?: string
      organizationName?: string
      role?: string
      isSuperAdmin?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    avatar?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    organizationId?: string
    organizationSlug?: string
    organizationName?: string
    role?: string
    isSuperAdmin?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
  },

  providers: [
    // Login com email/senha
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email e senha são obrigatórios')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          })

          if (!user || !user.passwordHash) {
            throw new Error('Credenciais inválidas')
          }

          if (!user.isActive) {
            throw new Error('Conta desativada')
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) {
            throw new Error('Credenciais inválidas')
          }

          // Atualizar último login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          }
        } catch (error) {
          console.error('[NextAuth] Erro no authorize:', error)
          return null
        }
      },
    }),

    // Login com Google (opcional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Para OAuth, verificar se usuário já existe
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          // Criar usuário automaticamente
          await prisma.user.create({
            data: {
              email: user.email!.toLowerCase(),
              name: user.name,
              avatar: user.image,
              emailVerified: new Date(),
            },
          })
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Primeiro login - adicionar dados do usuário ao token
      if (user) {
        token.id = user.id
        token.email = user.email!

        // Buscar flag de superadmin
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isSuperAdmin: true },
        })
        token.isSuperAdmin = dbUser?.isSuperAdmin ?? false
      }

      // Update session - quando o usuário atualiza dados
      if (trigger === 'update' && session) {
        token.organizationId = session.organizationId
        token.organizationSlug = session.organizationSlug
        token.organizationName = session.organizationName
        token.role = session.role
      }

      // Buscar organização ativa do usuário (se não tiver no token)
      if (token.id && !token.organizationId) {
        const membership = await prisma.organizationMember.findFirst({
          where: {
            userId: token.id,
            isActive: true,
          },
          include: {
            organization: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
          orderBy: {
            invitedAt: 'desc',
          },
        })

        if (membership) {
          token.organizationId = membership.organization.id
          token.organizationSlug = membership.organization.slug
          token.organizationName = membership.organization.name
          token.role = membership.role
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: session.user?.name,
        avatar: (session.user as any)?.image || (session.user as any)?.avatar,
        organizationId: token.organizationId,
        organizationSlug: token.organizationSlug,
        organizationName: token.organizationName,
        role: token.role,
        isSuperAdmin: token.isSuperAdmin,
      }
      return session
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Log de novo usuário
        console.log(`Novo usuário cadastrado: ${user.email}`)
      }
    },
  },
}
