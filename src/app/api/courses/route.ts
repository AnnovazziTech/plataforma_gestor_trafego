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

    const where: any = {
      isActive: true,
    }

    if (category && category !== 'Todos') {
      where.category = category
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        lessons: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, title: true, duration: true },
        },
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
      ],
    })

    // Get user enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
      select: { courseId: true, progress: true },
    })

    const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e.progress]))

    const coursesWithProgress = courses.map(c => ({
      ...c,
      isEnrolled: enrollmentMap.has(c.id),
      progress: enrollmentMap.get(c.id) || 0,
      lessonCount: c._count.lessons,
    }))

    return NextResponse.json(coursesWithProgress)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
