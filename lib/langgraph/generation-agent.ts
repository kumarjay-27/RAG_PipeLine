import { StateType } from './state'
import { llm } from '../gemini'

export async function generationAgent(state: StateType): Promise<Partial<StateType>> {
  try {
    const query = state.userQuery ?? ''
    if (!query.trim()) {
      return {
        finalAnswer: 'No question submitted.',
        currentStep: 'idle',
        inspectionMode: true,
      }
    }

    if (!state.retrievedChunks || state.retrievedChunks.length === 0) {
      return {
        finalAnswer: 'No context chunks retrieved. Cannot generate response.',
        currentStep: 'idle',
        inspectionMode: true,
      }
    }

    // Build context string from retrieved chunks
    const context = state.retrievedChunks
      .map((c, i) => `[${i + 1}] (relevance: ${(c.score * 100).toFixed(1)}%)\n${c.text}`)
      .join('\n\n')

    // Single prompt — exactly ONE LLM call, no loops, no retries
    const prompt = `You are a helpful assistant. Answer the question using ONLY the context provided below. If the answer is not in the context, say so clearly.

Context:
${context}

Question: ${query}

Answer:`

    const response = await llm.invoke(prompt)
    const finalAnswer = response.content as string

    return {
      finalAnswer,
      currentStep: 'idle',
      inspectionMode: true, // Pause for final inspection before completing
    }
  } catch (error: any) {
    console.error('Generation Agent Error:', error)
    return {
      errorMessage: error.message || 'Error occurred during generation',
      currentStep: 'complete',
      inspectionMode: true,
    }
  }
}
