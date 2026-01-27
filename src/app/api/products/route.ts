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
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {
      isActive: true,
    }

    if (category && category !== 'Todos') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { downloadCount: 'desc' },
      ],
    })

    // Check which products user has purchased
    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'COMPLETED',
      },
      select: { productId: true },
    })

    const purchasedIds = new Set(purchases.map(p => p.productId))

    const productsWithPurchaseStatus = products.map(p => ({
      ...p,
      isPurchased: purchasedIds.has(p.id),
    }))

    return NextResponse.json(productsWithPurchaseStatus)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
