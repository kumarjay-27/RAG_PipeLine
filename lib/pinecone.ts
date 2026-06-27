import { Pinecone } from '@pinecone-database/pinecone'

interface PineconeRecord {
  id: string
  values: number[]
  metadata: {
    text: string
    userId: string
    sessionId: string
    chunkIndex: number
  }
}

// In-memory fallback database for RAG chunks
const localDb = new Map<string, PineconeRecord>()

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

class MockIndex {
  async upsert(records: PineconeRecord[]) {
    for (const rec of records) {
      localDb.set(rec.id, rec)
    }
    return { upsertedCount: records.length }
  }

  async query(options: {
    vector: number[]
    topK: number
    filter?: { userId?: string; sessionId?: string }
    includeMetadata?: boolean
  }) {
    const matches: Array<{ id: string; score: number; values?: number[]; metadata?: any }> = []
    
    for (const rec of localDb.values()) {
      if (options.filter) {
        if (options.filter.userId && rec.metadata.userId !== options.filter.userId) continue
        if (options.filter.sessionId && rec.metadata.sessionId !== options.filter.sessionId) continue
      }
      
      const score = cosineSimilarity(options.vector, rec.values)
      matches.push({
        id: rec.id,
        score,
        metadata: options.includeMetadata ? rec.metadata : undefined
      })
    }
    
    matches.sort((a, b) => b.score - a.score)
    
    return {
      matches: matches.slice(0, options.topK)
    }
  }
}

const isMockEnabled = !process.env.PINECONE_API_KEY || process.env.PINECONE_API_KEY.trim() === ''

export const pinecone = isMockEnabled 
  ? null 
  : new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })

export const getPineconeIndex = () => {
  if (isMockEnabled) {
    return new MockIndex() as any
  }
  return pinecone!.index(process.env.PINECONE_INDEX_NAME!)
}
