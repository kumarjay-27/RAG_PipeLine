'use client'

import { EmbeddingInspectorProps } from '@/types/rag'
import { motion } from 'framer-motion'

export default function EmbeddingInspector({ embedding, totalChunks }: EmbeddingInspectorProps) {
  if (!embedding || embedding.length === 0) {
    return (
      <div className="card text-center text-muted">
        No embeddings generated yet. Upload a document to start chunking and embedding.
      </div>
    )
  }

  // Preview first 30 dimensions
  const previewDimensions = embedding.slice(0, 30)

  return (
    <div className="card w-full mb-4">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Vector Embedding Inspector</h3>
      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        Document split into <strong style={{ color: 'var(--text-primary)' }}>{totalChunks}</strong> chunks and embedded into{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{embedding.length}</strong> dimensions using Gemini <code>text-embedding-004</code>.
      </p>

      <div className="embedding-bar-container">
        {previewDimensions.map((val, i) => {
          const isPositive = val >= 0
          // Scale embedding values (~0.01 - 0.09) so they show up beautifully, cap at 100px height
          const barHeight = Math.min(Math.abs(val) * 600, 100)

          return (
            <motion.div
              key={i}
              className={`embedding-bar ${isPositive ? 'positive' : 'negative'}`}
              title={`Dimension ${i + 1}: ${val.toFixed(6)}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${barHeight}px`, opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.4, ease: 'easeOut' }}
            />
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Dimension 1</span>
        <span>Showing dimensions 1 - 30</span>
        <span>Dimension 30</span>
      </div>
    </div>
  )
}
