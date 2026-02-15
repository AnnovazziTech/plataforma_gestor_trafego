import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db/prisma'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/api/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`reset-password:${ip}`, RATE_LIMITS.password)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Dados incompletos.' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: tokenHash,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Link invalido ou ja utilizado.' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      })
      return NextResponse.json(
        { error: 'Link expirado. Solicite um novo link de recuperacao.' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: normalizedEmail },
        data: { passwordHash },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      }),
    ])

    return NextResponse.json({ message: 'Senha redefinida com sucesso.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erro ao redefinir senha. Tente novamente.' },
      { status: 500 }
    )
  }
}
