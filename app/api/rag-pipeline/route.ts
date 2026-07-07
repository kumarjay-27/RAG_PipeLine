import { NextResponse } from 'next/server'
import { loadSession, saveSession } from '@/lib/session-store'
import { ragGraph } from '@/lib/langgraph/graph'
import { GraphState } from '@/types/rag'

export const dynamic = 'force-dynamic'

const defaultState = (userId: string, sessionId: string): GraphState => ({
  userId,
  sessionId,
  uploadedDocumentText: null,
  userQuery: null,
  textChunks: [],
  embeddings: [],
  pineconeUpsertStatus: 'pending',
  queryEmbedding: [],
  retrievedChunks: [],
  finalAnswer: null,
  currentStep: 'idle',
  inspectionMode: false,
  errorMessage: null,
  params: {
    k: 4,
    chunkSize: 500,
    chunkOverlap: 50,
  },
})

export async function POST(request: Request) {
  try {
    const { sessionId, userId, action, payload } = await request.json()

    if (!sessionId || !userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Session ID, User ID, and Action are required.' },
        { status: 400 }
      )
    }

    let state = await loadSession(sessionId)
    if (!state) {
      state = defaultState(userId, sessionId)
    }

    if (action === 'upload') {
      state.uploadedDocumentText = payload
      state.textChunks = []
      state.embeddings = []
      state.pineconeUpsertStatus = 'pending'
      state.queryEmbedding = []
      state.retrievedChunks = []
      state.finalAnswer = null
      state.errorMessage = null
      state.currentStep = 'idle'
      state.inspectionMode = false
    } else if (action === 'query') {
      state.userQuery = payload
      state.queryEmbedding = []
      state.retrievedChunks = []
      state.finalAnswer = null
      state.errorMessage = null
      state.currentStep = 'idle'
      state.inspectionMode = false
    } else {
      return NextResponse.json(
        { success: false, error: `Invalid action: ${action}` },
        { status: 400 }
      )
    }

    const resultState = await ragGraph.invoke(state) as GraphState
    await saveSession(sessionId, resultState)

    return NextResponse.json({
      success: true,
      state: resultState,
    })
  } catch (error: any) {
    console.error('RAG Pipeline API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred in pipeline' },
      { status: 500 }
    )
  }
}
