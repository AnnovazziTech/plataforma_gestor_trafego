import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const prospect = await prisma.prospect.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    })

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    return NextResponse.json(prospect)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const prospect = await prisma.prospect.updateMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      data: {
        companyName: data.companyName,
        website: data.website,
        industry: data.industry,
        size: data.size,
        location: data.location,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        socialMedia: data.socialMedia,
        status: data.status,
        score: data.score,
        notes: data.notes,
        isFavorite: data.isFavorite,
        lastContactAt: data.lastContactAt ? new Date(data.lastContactAt) : undefined,
      },
    })

    if (prospect.count === 0) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    const updated = await prisma.prospect.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    return NextResponse.json(updated)
  } catch (error) {
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

    const result = await prisma.prospect.deleteMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
