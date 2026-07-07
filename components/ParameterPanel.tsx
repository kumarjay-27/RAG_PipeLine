'use client'
import { ParameterPanelProps } from '@/types/rag'
import { useState, useEffect } from 'react'

export default function ParameterPanel({ params, onApply }: ParameterPanelProps) {
  const [k, setK] = useState(params?.k ?? 4)
  const [chunkSize, setChunkSize] = useState(params?.chunkSize ?? 500)
  const [chunkOverlap, setChunkOverlap] = useState(params?.chunkOverlap ?? 50)

  useEffect(() => {
    if (params) {
      setK(params.k)
      setChunkSize(params.chunkSize)
      setChunkOverlap(params.chunkOverlap)
    }
  }, [params])

  const handleApply = () => {
    // If overlap exceeds chunk size, cap it
    const activeOverlap = Math.min(chunkOverlap, chunkSize - 50)
    onApply({
      k,
      chunkSize,
      chunkOverlap: activeOverlap
    })
  }

  return (
    <div className="card w-full">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>RAG Parameter Control Panel</h3>
      
      <div className="slider-group">
        <div className="slider-label">
          <span>Chunks to retrieve (k)</span>
          <span className="slider-value">{k}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          className="slider"
          value={k}
          onChange={(e) => setK(parseInt(e.target.value))}
        />
      </div>

      <div className="slider-group">
        <div className="slider-label">
          <span>Chunk size (characters)</span>
          <span className="slider-value">{chunkSize}</span>
        </div>
        <input
          type="range"
          min="200"
          max="1000"
          step="50"
          className="slider"
          value={chunkSize}
          onChange={(e) => setChunkSize(parseInt(e.target.value))}
        />
      </div>

      <div className="slider-group">
        <div className="slider-label">
          <span>Chunk overlap</span>
          <span className="slider-value">{chunkOverlap}</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="10"
          className="slider"
          value={chunkOverlap}
          onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
        />
      </div>

      <button
        className="btn-primary w-full mt-2"
        onClick={handleApply}
      >
        Apply & Re-run Retrieval
      </button>
    </div>
  )
}
