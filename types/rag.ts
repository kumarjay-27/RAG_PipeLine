export type PipelineStep = 
  'idle' | 'ingestion' | 'retrieval' | 'generation' | 'complete'

export type UpsertStatus = 'pending' | 'complete' | 'error'

export interface RetrievedChunk {
  text: string
  score: number
  chunkIndex: number
}

export interface GraphState {
  userId: string
  sessionId: string
  uploadedDocumentText: string | null
  userQuery: string | null
  textChunks: string[]
  embeddings: number[][]
  pineconeUpsertStatus: UpsertStatus
  queryEmbedding: number[]
  retrievedChunks: RetrievedChunk[]
  finalAnswer: string | null
  currentStep: PipelineStep
  inspectionMode: boolean
  errorMessage: string | null
  params: {
    k: number
    chunkSize: number
    chunkOverlap: number
  }
}

export interface ApiResponse {
  success: boolean
  state?: GraphState
  error?: string
}

export interface PipelineVisualizerProps {
  currentStep: PipelineStep
  completedSteps: PipelineStep[]
}

export interface EmbeddingInspectorProps {
  embedding: number[]
  totalChunks: number
}

export interface ChunkInspectorProps {
  chunks: RetrievedChunk[]
}

export interface ParameterPanelProps {
  params: GraphState['params']
  onApply: (params: GraphState['params']) => void
}

export interface DocumentUploaderProps {
  onUpload: (text: string, fileName: string) => void
  loading: boolean
}
