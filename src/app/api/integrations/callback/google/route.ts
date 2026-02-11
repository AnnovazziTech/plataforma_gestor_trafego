// API Route: Callback OAuth do Google Ads

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db/prisma'
import { encrypt } from '@/lib/crypto/encryption'
import { exchangeGoogleCode, getGoogleAdAccounts } from '@/lib/integrations/google'
import { createAuditLog } from '@/lib/api/middleware'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Erro do OAuth
    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/settings/integrations?error=${encodeURIComponent(error)}`
      )
    }

    // Validar parametros
    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/settings/integrations?error=Parametros invalidos`
      )
    }

    // Decodificar e validar state com HMAC
    let stateData: {
      organizationId: string
      userId: string
      platform: string
      timestamp: number
    }

    try {
      const decoded = Buffer.from(state, 'base64url').toString()
      const pipeIndex = decoded.lastIndexOf('|')
      if (pipeIndex === -1) throw new Error('Invalid state format')

      const payload = decoded.substring(0, pipeIndex)
      const receivedHmac = decoded.substring(pipeIndex + 1)

      // Validar HMAC
      const hmacSecret = process.env.NEXTAUTH_SECRET || ''
      const expectedHmac = crypto
        .createHmac('sha256', hmacSecret)
        .update(payload)
        .digest('base64url')

      if (receivedHmac !== expectedHmac) throw new Error('Invalid state signature')

      stateData = JSON.parse(payload)
    } catch {
      return NextResponse.redirect(
        `${baseUrl}/settings/integrations?error=State invalido`
      )
    }

    // Verificar se state nao expirou (10 minutos)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(
        `${baseUrl}/settings/integrations?error=Sessao expirada, tente novamente`
      )
    }

    // Trocar codigo por tokens
    const redirectUri = `${baseUrl}/api/integrations/callback/google`
    const { accessToken, refreshToken, expiresIn } = await exchangeGoogleCode(code, redirectUri)

    // Buscar contas de anuncio
    const adAccounts = await getGoogleAdAccounts(accessToken)

    if (adAccounts.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/settings/integrations?error=Nenhuma conta de anuncio encontrada`
      )
    }

    // Criptografar tokens
    const encryptedAccessToken = encrypt(accessToken)
    const encryptedRefreshToken = encrypt(refreshToken)

    // Calcular expiracao
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

    // Criar integracao e contas em transacao
    const integration = await prisma.$transaction(async (tx) => {
      // Criar integracao principal
      const integration = await tx.integration.create({
        data: {
          organizationId: stateData.organizationId,
          platform: 'GOOGLE',
          name: 'Google Ads',
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt,
          status: 'CONNECTED',
          lastSyncAt: new Date(),
        },
      })

      // Criar contas de anuncio
      for (const account of adAccounts) {
        await tx.adAccount.create({
          data: {
            integrationId: integration.id,
            platformAdAccountId: account.id,
            name: account.descriptiveName,
            currency: account.currencyCode,
            timezone: account.timeZone,
          },
        })
      }

      return integration
    })

    // Log de auditoria
    await createAuditLog({
      organizationId: stateData.organizationId,
      userId: stateData.userId,
      action: 'integration.connected',
      entity: 'integration',
      entityId: integration.id,
      newData: {
        platform: 'GOOGLE',
        adAccountsCount: adAccounts.length,
      },
      request: req,
    })

    return NextResponse.redirect(
      `${baseUrl}/settings/integrations?success=Google Ads conectado com sucesso`
    )
  } catch (error) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(
      `${baseUrl}/settings/integrations?error=Erro ao conectar Google Ads`
    )
  }
}
