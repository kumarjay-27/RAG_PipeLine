import { StateType } from './state'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { embeddingModel } from '../gemini'
import { getPineconeIndex } from '../pinecone'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function ingestionAgent(state: StateType): Promise<Partial<StateType>> {
  try {
    const text = state.uploadedDocumentText ?? ''
    if (!text.trim()) {
      return {
        textChunks: [],
        embeddings: [],
        pineconeUpsertStatus: 'complete',
        currentStep: 'idle',
        inspectionMode: true,
      }
    }

    // STEP 1: CHUNKING
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: state.params.chunkSize,
      chunkOverlap: state.params.chunkOverlap,
    })
    const chunks = await splitter.splitText(text)

    // STEP 2: PARALLEL BATCH EMBEDDING (groups of 50 chunks, running concurrently)
    const embedBatchSize = 50
    const embedBatches: string[][] = []
    for (let i = 0; i < chunks.length; i += embedBatchSize) {
      embedBatches.push(chunks.slice(i, i + embedBatchSize))
    }

    const embeddingResults = await Promise.all(
      embedBatches.map(batch => embeddingModel.embedDocuments(batch))
    )
    const allEmbeddings = embeddingResults.flat()

    // STEP 3: PARALLEL PINECONE UPSERT (batches of 100, running concurrently)
    const index = getPineconeIndex()
    const vectors = chunks.map((chunk, i) => ({
      id: `${state.sessionId}-chunk-${i}`,
      values: allEmbeddings[i],
      metadata: {
        text: chunk,
        userId: state.userId,
        sessionId: state.sessionId,
        chunkIndex: i,
      },
    }))

    const upsertPromises = []
    for (let i = 0; i < vectors.length; i += 100) {
      const batch = vectors.slice(i, i + 100)
      upsertPromises.push(index.upsert(batch))
    }
    await Promise.all(upsertPromises)

    return {
      textChunks: chunks,
      embeddings: allEmbeddings,
      pineconeUpsertStatus: 'complete',
      currentStep: 'idle', // Supervisor will route
      inspectionMode: true, // Pause for student inspection
    }
  } catch (error: any) {
    console.error('Ingestion Agent Error:', error)
    return {
      pineconeUpsertStatus: 'error',
      errorMessage: error.message || 'Error occurred during ingestion',
      currentStep: 'complete',
      inspectionMode: true,
    }
  }
}
