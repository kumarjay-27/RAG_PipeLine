'use client'

import { ChunkInspectorProps } from '@/types/rag'
import { motion } from 'framer-motion'

export default function ChunkInspector({ chunks }: ChunkInspectorProps) {
  if (!chunks || chunks.length === 0) {
    return (
      <div className="card text-center text-muted">
        No chunks retrieved yet. Submit a query to trigger vector database similarity search.
      </div>
    )
  }

  // Sort chunks by score descending
  const sortedChunks = [...chunks].sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col gap-2">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Retrieved Context Chunks</h3>
      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
        These text blocks represent the top-k matches returned by the similarity query.
      </p>

      <div className="chunk-grid">
        {sortedChunks.map((chunk, index) => {
          let scoreClass = 'badge-error'
          if (chunk.score > 0.8) scoreClass = 'badge-success'
          else if (chunk.score > 0.6) scoreClass = 'badge-warning'

          return (
            <motion.div
              key={chunk.chunkIndex}
              className="chunk-card"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
            >
              <div className="chunk-card-header">
                <span className="chunk-card-title">Chunk #{chunk.chunkIndex}</span>
                <span className={`badge ${scoreClass}`}>
                  Similarity: {(chunk.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="chunk-card-text">{chunk.text}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
