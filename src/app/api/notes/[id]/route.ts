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

    const note = await prisma.note.updateMany({
      where: {
        id,
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        isFavorite: data.isFavorite,
        isPinned: data.isPinned,
      },
    })

    if (note.count === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const updated = await prisma.note.findFirst({
      where: { id },
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

    const result = await prisma.note.deleteMany({
      where: {
        id,
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
