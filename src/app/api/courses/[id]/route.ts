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

    const course = await prisma.course.findFirst({
      where: { id, isActive: true },
      include: {
        lessons: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        organizationId_userId_courseId: {
          organizationId: session.user.organizationId,
          userId: session.user.id,
          courseId: id,
        },
      },
    })

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        lessonId: { in: course.lessons.map(l => l.id) },
      },
    })

    const progressMap = new Map(lessonProgress.map(p => [p.lessonId, p]))

    const lessonsWithProgress = course.lessons.map(l => ({
      ...l,
      isCompleted: progressMap.get(l.id)?.isCompleted || false,
      watchedSeconds: progressMap.get(l.id)?.watchedSeconds || 0,
    }))

    return NextResponse.json({
      ...course,
      lessons: lessonsWithProgress,
      isEnrolled: !!enrollment,
      progress: enrollment?.progress || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
