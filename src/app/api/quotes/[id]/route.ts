import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const quote = await prisma.quote.updateMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        services: data.services,
        totalValue: data.totalValue,
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        notes: data.notes,
      },
    })

    if (quote.count === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const updated = await prisma.quote.findFirst({ where: { id } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const result = await prisma.quote.deleteMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
