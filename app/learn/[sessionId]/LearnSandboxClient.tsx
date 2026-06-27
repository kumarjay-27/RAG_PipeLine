'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraphState, PipelineStep } from '@/types/rag'
import PipelineVisualizer from '@/components/PipelineVisualizer'
import DocumentUploader from '@/components/DocumentUploader'
import EmbeddingInspector from '@/components/EmbeddingInspector'
import ParameterPanel from '@/components/ParameterPanel'
import ChunkInspector from '@/components/ChunkInspector'

interface LearnSandboxClientProps {
  sessionId: string
  userId: string
  initialDocName: string
}

export default function LearnSandboxClient({
  sessionId,
  userId,
  initialDocName,
}: LearnSandboxClientProps) {
  const [state, setState] = useState<GraphState | null>(null)
  const [loading, setLoading] = useState(false)
  const [docName, setDocName] = useState(initialDocName)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch initial session state on load if it exists in store
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const data = await res.json()
        if (data.success && data.state) {
          setState(data.state)
        }
      } catch (err) {
        console.error('Failed to load existing session:', err)
      }
    }
    fetchSession()
  }, [sessionId])

  const handleDocumentUpload = async (text: string, fileName: string) => {
    setLoading(true)
    setError(null)
    try {
      // 1. Update the document name in the DB
      await fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, documentName: fileName }),
      })
      setDocName(fileName)

      // 2. Trigger ingestion pipeline
      const res = await fetch('/api/rag-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          action: 'upload',
          payload: text,
        }),
      })

      const data = await res.json()
      if (data.success && data.state) {
        setState(data.state)
      } else {
        setError(data.error || 'Failed to process document.')
      }
    } catch (err: any) {
      setError('An error occurred during document ingestion.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuerySubmit = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/rag-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          action: 'query',
          payload: query,
        }),
      })

      const data = await res.json()
      if (data.success && data.state) {
        setState(data.state)
      } else {
        setError(data.error || 'Failed to run query.')
      }
    } catch (err: any) {
      setError('An error occurred during retrieval.')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyParams = async (newParams: GraphState['params']) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          updatedParams: newParams,
        }),
      })

      const data = await res.json()
      if (data.success && data.state) {
        setState(data.state)
      } else {
        setError(data.error || 'Failed to update parameters.')
      }
    } catch (err: any) {
      setError('An error occurred while updating retrieval parameters.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueToGeneration = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await res.json()
      if (data.success && data.state) {
        setState(data.state)
      } else {
        setError(data.error || 'Failed to resume generation.')
      }
    } catch (err: any) {
      setError('An error occurred during LLM response generation.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSession = () => {
    setState(null)
    setQuery('')
    setError(null)
  }

  // Derive completed stages
  const getCompletedSteps = (): PipelineStep[] => {
    const completed: PipelineStep[] = []
    if (!state) return completed

    if (state.textChunks && state.textChunks.length > 0) {
      completed.push('ingestion')
    }
    if (state.retrievedChunks && state.retrievedChunks.length > 0) {
      completed.push('retrieval')
    }
    if (state.finalAnswer) {
      completed.push('generation')
    }
    return completed
  }

  // Determine current active pipeline view step
  const getVisualizerStep = (): PipelineStep => {
    if (loading) {
      if (!state?.textChunks || state.textChunks.length === 0) return 'ingestion'
      if (!state?.retrievedChunks || state.retrievedChunks.length === 0) return 'retrieval'
      return 'generation'
    }

    if (!state) return 'idle'
    if (state.textChunks.length > 0 && !state.userQuery) return 'idle' // Done ingestion, awaiting query
    if (state.userQuery && state.retrievedChunks.length === 0) return 'retrieval'
    if (state.retrievedChunks.length > 0 && !state.finalAnswer) return 'retrieval' // retrieved context, waiting for resume
    if (state.finalAnswer) return 'complete'
    return 'idle'
  }

  const completedSteps = getCompletedSteps()
  const visualStep = getVisualizerStep()

  const showIngestionResults = state && state.textChunks.length > 0
  const showRetrievalResults = state && state.retrievedChunks.length > 0
  const isWaitingForGeneration = showRetrievalResults && !state.finalAnswer && state.inspectionMode

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Learn RAG Simulator</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Active Session: <strong style={{ color: 'var(--text-primary)' }}>{docName}</strong>
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          &larr; Back to Dashboard
        </Link>
      </header>

      {/* Pipeline Status Board */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          RAG Pipeline Execution Path
        </h2>
        <PipelineVisualizer currentStep={visualStep} completedSteps={completedSteps} />
      </section>

      {error && (
        <div className="badge badge-error w-full text-center" style={{ padding: '0.75rem', display: 'block', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      <div className="grid-2">
        {/* Left Column: Sandbox Config & Controls */}
        <div className="flex flex-col gap-4">
          {!showIngestionResults ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Step 1: Ingest Document</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Upload a `.txt` or `.pdf` file to start. The simulator will segment the text based on your chunking parameters and embed them into vector space.
              </p>
              <DocumentUploader onUpload={handleDocumentUpload} loading={loading} />
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Document</h3>
                <button className="btn-secondary" onClick={handleResetSession} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  Replace File
                </button>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>File Name:</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{docName}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-primary">{state.textChunks.length} Chunks</span>
                  <span className="badge badge-success">Vectorized</span>
                </div>
              </div>
            </div>
          )}

          {showIngestionResults && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Step 2: Submit Similarity Search</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Type a query. The engine will convert it into an embedding vector, look up matching chunks in the vector database using cosine similarity, and retrieve the closest contexts.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Ask a question about the document..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
                <button className="btn-primary" onClick={handleQuerySubmit} disabled={loading || !query.trim()}>
                  {loading && !showRetrievalResults ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Search'}
                </button>
              </div>
            </div>
          )}

          {showRetrievalResults && (
            <ParameterPanel params={state.params} onApply={handleApplyParams} />
          )}

          {isWaitingForGeneration && (
            <div className="card" style={{ borderStyle: 'solid', borderColor: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                Pipeline Paused for Human Inspection
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Similarity lookup has completed. You can view the retrieved chunks on the right and adjust search settings using the panel above. Click below to continue and generate the response.
              </p>
              <button className="btn-primary w-full" onClick={handleContinueToGeneration} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : 'Continue to Response Generation'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Visual Inspectors */}
        <div className="flex flex-col gap-4">
          {showIngestionResults && (
            <EmbeddingInspector embedding={state.embeddings[0]} totalChunks={state.textChunks.length} />
          )}

          {showRetrievalResults && (
            <ChunkInspector chunks={state.retrievedChunks} />
          )}

          {state?.finalAnswer && (
            <div className="answer-card">
              <div className="answer-title">Synthesized Answer (Gemini-2.5-Flash)</div>
              <div className="answer-text">
                {state.finalAnswer.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.15 }}
                    style={{ display: 'inline-block', marginRight: '4px' }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {!state && (
            <div className="card text-center text-muted" style={{ padding: '6rem 2rem' }}>
              <svg style={{ width: '64px', height: '64px', color: 'var(--border)', marginBottom: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Interactive RAG Sandbox</h3>
              <p style={{ fontSize: '0.85rem' }}>Upload text or PDF documents to inspect RAG mechanics step-by-step.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
