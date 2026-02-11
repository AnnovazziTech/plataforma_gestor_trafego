import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const linkPage = await prisma.linkPage.findFirst({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
      include: {
        links: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(linkPage)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Check if username is available
    const existing = await prisma.linkPage.findUnique({
      where: { username: data.username },
    })

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const linkPage = await prisma.linkPage.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        avatar: data.avatar,
        theme: data.theme || 'dark',
        accentColor: data.accentColor || '#3B82F6',
      },
      include: {
        links: true,
      },
    })

    return NextResponse.json(linkPage, { status: 201 })
  } catch (error) {
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

    // Check if username is available (if changing)
    if (data.username) {
      const existing = await prisma.linkPage.findFirst({
        where: {
          username: data.username,
          NOT: {
            organizationId: session.user.organizationId,
            userId: session.user.id,
          },
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    const linkPage = await prisma.linkPage.upsert({
      where: {
        id: data.id || 'new',
      },
      create: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        avatar: data.avatar,
        theme: data.theme || 'dark',
        accentColor: data.accentColor || '#3B82F6',
      },
      update: {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        avatar: data.avatar,
        theme: data.theme,
        accentColor: data.accentColor,
      },
      include: {
        links: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(linkPage)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
