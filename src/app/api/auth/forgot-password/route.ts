import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db/prisma'
import { generatePasswordResetToken } from '@/lib/crypto/encryption'
import { sendPasswordResetEmail } from '@/lib/email/send'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/api/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`forgot-password:${ip}`, RATE_LIMITS.password)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'OK' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Always return 200 to not leak whether email exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (user) {
      // Delete any existing tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      })

      const token = generatePasswordResetToken()
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token: tokenHash,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

      await sendPasswordResetEmail(normalizedEmail, resetUrl)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'OK' })
  }
}
