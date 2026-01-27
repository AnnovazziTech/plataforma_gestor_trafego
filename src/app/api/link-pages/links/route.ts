import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Get user's link page
    const linkPage = await prisma.linkPage.findFirst({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
    })

    if (!linkPage) {
      return NextResponse.json({ error: 'Link page not found' }, { status: 404 })
    }

    // Get max sortOrder
    const maxOrder = await prisma.linkItem.aggregate({
      where: { linkPageId: linkPage.id },
      _max: { sortOrder: true },
    })

    const link = await prisma.linkItem.create({
      data: {
        linkPageId: linkPage.id,
        title: data.title,
        url: data.url,
        icon: data.icon || 'Link2',
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Verify ownership
    const linkPage = await prisma.linkPage.findFirst({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
    })

    if (!linkPage) {
      return NextResponse.json({ error: 'Link page not found' }, { status: 404 })
    }

    const link = await prisma.linkItem.updateMany({
      where: {
        id: data.id,
        linkPageId: linkPage.id,
      },
      data: {
        title: data.title,
        url: data.url,
        icon: data.icon,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })

    if (link.count === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const updated = await prisma.linkItem.findFirst({ where: { id: data.id } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('id')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    // Verify ownership
    const linkPage = await prisma.linkPage.findFirst({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
    })

    if (!linkPage) {
      return NextResponse.json({ error: 'Link page not found' }, { status: 404 })
    }

    const result = await prisma.linkItem.deleteMany({
      where: {
        id: linkId,
        linkPageId: linkPage.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
