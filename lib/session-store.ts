import { GraphState } from '@/types/rag'

// In-memory store for HITL graph states (dev only)
const sessionStore = new Map<string, GraphState>()

export function saveSession(sessionId: string, state: GraphState): void {
  sessionStore.set(sessionId, state)
}

export function loadSession(sessionId: string): GraphState | null {
  return sessionStore.get(sessionId) ?? null
}

export function deleteSession(sessionId: string): void {
  sessionStore.delete(sessionId)
}
