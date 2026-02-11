import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: lessonId } = await params
    const data = await request.json()

    // Get lesson and course
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, isActive: true },
      include: { course: true },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        organizationId_userId_lessonId: {
          organizationId: session.user.organizationId,
          userId: session.user.id,
          lessonId,
        },
      },
      create: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        lessonId,
        isCompleted: data.isCompleted || false,
        watchedSeconds: data.watchedSeconds || 0,
        completedAt: data.isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: data.isCompleted,
        watchedSeconds: data.watchedSeconds,
        completedAt: data.isCompleted ? new Date() : undefined,
      },
    })

    // Update course enrollment progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId, isActive: true },
    })

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        lesson: { courseId: lesson.courseId },
        isCompleted: true,
      },
    })

    const courseProgress = Math.round((completedLessons / totalLessons) * 100)

    await prisma.enrollment.updateMany({
      where: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        courseId: lesson.courseId,
      },
      data: {
        progress: courseProgress,
        completedAt: courseProgress === 100 ? new Date() : null,
      },
    })

    return NextResponse.json({ progress, courseProgress })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
