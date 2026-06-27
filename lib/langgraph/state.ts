import { Annotation } from '@langchain/langgraph'
import { RetrievedChunk, PipelineStep, UpsertStatus } from '@/types/rag'

export const GraphAnnotation = Annotation.Root({
  userId: Annotation<string>({
    reducer: (_, b) => b,
  }),
  sessionId: Annotation<string>({
    reducer: (_, b) => b,
  }),
  uploadedDocumentText: Annotation<string | null>({
    reducer: (_, b) => b,
  }),
  userQuery: Annotation<string | null>({
    reducer: (_, b) => b,
  }),
  textChunks: Annotation<string[]>({
    reducer: (_, b) => b,
  }),
  embeddings: Annotation<number[][]>({
    reducer: (_, b) => b,
  }),
  pineconeUpsertStatus: Annotation<UpsertStatus>({
    reducer: (_, b) => b,
  }),
  queryEmbedding: Annotation<number[]>({
    reducer: (_, b) => b,
  }),
  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_, b) => b,
  }),
  finalAnswer: Annotation<string | null>({
    reducer: (_, b) => b,
  }),
  currentStep: Annotation<PipelineStep>({
    reducer: (_, b) => b,
  }),
  inspectionMode: Annotation<boolean>({
    reducer: (_, b) => b,
  }),
  errorMessage: Annotation<string | null>({
    reducer: (_, b) => b,
  }),
  params: Annotation<{
    k: number
    chunkSize: number
    chunkOverlap: number
  }>({
    reducer: (_, b) => b,
  }),
})

export type StateType = typeof GraphAnnotation.State
