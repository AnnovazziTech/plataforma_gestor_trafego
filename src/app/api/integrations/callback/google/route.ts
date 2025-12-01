// API Route: Callback OAuth do Google Ads

import { NextRequest, NextResponse } from 'next/server'
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
      console.error('Erro OAuth Google:', error)
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

    // Decodificar state
    let stateData: {
      organizationId: string
      userId: string
      platform: string
      timestamp: number
    }

    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
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
    console.error('Erro no callback Google:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(
      `${baseUrl}/settings/integrations?error=Erro ao conectar Google Ads`
    )
  }
}
