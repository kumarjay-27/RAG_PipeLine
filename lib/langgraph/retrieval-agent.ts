import { StateType } from './state'
import { embeddingModel } from '../gemini'
import { getPineconeIndex } from '../pinecone'
import { RetrievedChunk } from '@/types/rag'

export async function retrievalAgent(state: StateType): Promise<Partial<StateType>> {
  try {
    const query = state.userQuery ?? ''
    if (!query.trim()) {
      return {
        queryEmbedding: [],
        retrievedChunks: [],
        currentStep: 'idle',
        inspectionMode: true,
      }
    }

    // STEP 1: Embed the user query
    const [queryEmbedding] = await embeddingModel.embedDocuments([query])

    // STEP 2: Pinecone similarity search
    const index = getPineconeIndex()
    const results = await index.query({
      vector: queryEmbedding,
      topK: state.params.k,
      filter: { userId: state.userId, sessionId: state.sessionId },
      includeMetadata: true,
    })

    // STEP 3: Map to RetrievedChunk[]
    const retrievedChunks: RetrievedChunk[] = (results.matches ?? []).map((m: any) => ({
      text: m.metadata?.text as string ?? '',
      score: m.score ?? 0,
      chunkIndex: m.metadata?.chunkIndex as number ?? 0,
    }))

    return {
      queryEmbedding,
      retrievedChunks,
      currentStep: 'idle',
      inspectionMode: true,
    }
  } catch (error: any) {
    console.error('Retrieval Agent Error:', error)
    return {
      errorMessage: error.message || 'Error occurred during retrieval',
      currentStep: 'complete',
      inspectionMode: true,
    }
  }
}
