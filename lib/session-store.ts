import { prisma } from './prisma'
import { GraphState } from '@/types/rag'

export async function saveSession(sessionId: string, state: GraphState): Promise<void> {
  await prisma.ragSession.update({
    where: { id: sessionId },
    data: {
      state: JSON.stringify(state),
    },
  })
}

export async function loadSession(sessionId: string): Promise<GraphState | null> {
  try {
    const session = await prisma.ragSession.findUnique({
      where: { id: sessionId },
    })
    if (!session || !session.state) return null
    return JSON.parse(session.state) as GraphState
  } catch (error) {
    console.error('Failed to load session from db:', error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.ragSession.update({
    where: { id: sessionId },
    data: {
      state: null,
    },
  })
}
