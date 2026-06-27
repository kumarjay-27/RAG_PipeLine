import { StateType } from './state'
import { END } from '@langchain/langgraph'

export function supervisorAgent(state: StateType): Partial<StateType> {
  // If we are pausing for human inspection, route to complete (which routes to END)
  if (state.inspectionMode) {
    return { currentStep: 'complete' }
  }

  // If doc uploaded but not yet chunked → go to ingestion
  if (state.uploadedDocumentText && state.textChunks.length === 0) {
    return { currentStep: 'ingestion', inspectionMode: false }
  }
  // If query submitted but no chunks retrieved → go to retrieval
  if (state.userQuery && state.retrievedChunks.length === 0) {
    return { currentStep: 'retrieval', inspectionMode: false }
  }
  // If context retrieved but no answer yet → go to generation
  if (state.retrievedChunks.length > 0 && !state.finalAnswer) {
    return { currentStep: 'generation', inspectionMode: false }
  }
  // All done — pause for inspection
  return { currentStep: 'complete', inspectionMode: true }
}

export function routeFromSupervisor(state: StateType): string {
  if (state.currentStep === 'ingestion') return 'ingestion'
  if (state.currentStep === 'retrieval') return 'retrieval'
  if (state.currentStep === 'generation') return 'generation'
  return END
}
