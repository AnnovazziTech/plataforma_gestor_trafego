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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')

    const where: any = {
      organizationId: session.user.organizationId,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (industry && industry !== 'Todas') {
      where.industry = industry
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    const prospects = await prisma.prospect.findMany({
      where,
      orderBy: [
        { isFavorite: 'desc' },
        { score: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(prospects)
  } catch (error) {
    console.error('Error fetching prospects:', error)
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

    const prospect = await prisma.prospect.create({
      data: {
        organizationId: session.user.organizationId,
        companyName: data.companyName,
        website: data.website,
        industry: data.industry,
        size: data.size,
        location: data.location,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        socialMedia: data.socialMedia,
        notes: data.notes,
        score: data.score || 50,
      },
    })

    return NextResponse.json(prospect, { status: 201 })
  } catch (error) {
    console.error('Error creating prospect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
