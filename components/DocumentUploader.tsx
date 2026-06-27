'use client'

import { DocumentUploaderProps } from '@/types/rag'
import { useState, useRef } from 'react'

export default function DocumentUploader({ onUpload, loading }: DocumentUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const processFile = async (file: File) => {
    setError(null)
    setFileName(file.name)
    setPreviewText(null)

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension !== 'pdf' && extension !== 'txt') {
      setError('Invalid file type. Please upload a .txt or .pdf file.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to upload and parse file.')
      } else {
        const textPreview = data.documentText ? data.documentText.slice(0, 200) + '...' : ''
        setPreviewText(textPreview)
        onUpload(data.documentText, file.name)
      }
    } catch (err: any) {
      setError('An error occurred during upload. Please try again.')
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (loading) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const triggerFileInput = () => {
    if (loading) return
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.txt"
        onChange={handleFileChange}
      />
      
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {loading ? (
          <div className="flex flex-col align-center gap-2">
            <div className="spinner" />
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Uploading and parsing document...</p>
          </div>
        ) : (
          <div className="flex flex-col align-center gap-2">
            <svg
              style={{ width: '48px', height: '48px', color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Drag & drop document here, or click to browse</p>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Accepts .pdf and .txt documents</p>
          </div>
        )}
      </div>

      {error && (
        <div className="badge badge-error w-full text-center mt-2" style={{ padding: '0.5rem', display: 'block', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      {!error && fileName && !loading && (
        <div className="card mt-2" style={{ borderStyle: 'solid', borderColor: 'var(--border)', background: 'var(--bg-secondary)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-success">Parsed Successfully</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{fileName}</strong>
          </div>
          {previewText && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(5, 5, 8, 0.4)', padding: '0.75rem', borderRadius: '4px', fontStyle: 'italic', border: '1px solid var(--border)' }}>
              &ldquo;{previewText}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
