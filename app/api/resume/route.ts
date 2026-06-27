import { NextResponse } from 'next/server'
import { loadSession, saveSession } from '@/lib/session-store'
import { ragGraph } from '@/lib/langgraph/graph'
import { GraphState } from '@/types/rag'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { sessionId, updatedParams } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required.' },
        { status: 400 }
      )
    }

    const state = loadSession(sessionId)
    if (!state) {
      return NextResponse.json(
        { success: false, error: `Session not found: ${sessionId}` },
        { status: 404 }
      )
    }

    if (updatedParams) {
      state.params = { ...state.params, ...updatedParams }

      // If parameters changed and pipeline was already complete, reset retrieval/generation to run again
      if (state.currentStep === 'complete') {
        state.queryEmbedding = []
        state.retrievedChunks = []
        state.finalAnswer = null
        state.currentStep = 'idle'
      }
    }

    state.inspectionMode = false
    state.errorMessage = null

    const resultState = await ragGraph.invoke(state) as GraphState
    saveSession(sessionId, resultState)

    return NextResponse.json({
      success: true,
      state: resultState,
    })
  } catch (error: any) {
    console.error('Resume API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resume RAG pipeline.' },
      { status: 500 }
    )
  }
}
