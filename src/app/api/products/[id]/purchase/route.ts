import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendConversionEvent, extractClientIp, extractUserAgent } from '@/lib/meta/conversions-api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        organizationId_productId: {
          organizationId: session.user.organizationId,
          productId: id,
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'Product already purchased' }, { status: 400 })
    }

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        productId: id,
        price: product.price,
        status: 'COMPLETED',
      },
    })

    // Increment download count
    await prisma.product.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    })

    // Meta Conversions API: Purchase
    sendConversionEvent({
      event_name: 'Purchase',
      user_data: {
        em: session.user.email ?? undefined,
        client_ip_address: extractClientIp(request),
        client_user_agent: extractUserAgent(request),
      },
      custom_data: {
        currency: 'BRL',
        value: Number(product.price),
        content_ids: [id],
      },
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error purchasing product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
