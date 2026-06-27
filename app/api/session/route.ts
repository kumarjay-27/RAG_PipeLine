import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const documentName = body.documentName || 'Untitled Document'

    const newSession = await prisma.ragSession.create({
      data: {
        userId: session.user.id,
        documentName,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
    })
  } catch (error: any) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId, documentName } = await request.json()
    if (!sessionId || !documentName) {
      return NextResponse.json(
        { success: false, error: 'Session ID and document name are required' },
        { status: 400 }
      )
    }

    const updatedSession = await prisma.ragSession.updateMany({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      data: {
        documentName,
      },
    })

    return NextResponse.json({
      success: true,
      updated: updatedSession.count > 0,
    })
  } catch (error: any) {
    console.error('Update session error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update session' },
      { status: 500 }
    )
  }
}
