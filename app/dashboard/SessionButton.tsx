'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SessionButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartSession = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentName: 'Untitled Session' }),
      })

      const data = await res.json()
      if (data.success && data.sessionId) {
        router.push(`/learn/${data.sessionId}`)
      } else {
        alert(data.error || 'Failed to start session')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while creating session.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className="btn-primary"
      onClick={handleStartSession}
      disabled={loading}
      style={{ padding: '0.85rem 2rem', fontSize: '1rem', width: 'auto' }}
    >
      {loading ? (
        <div className="spinner" style={{ width: '18px', height: '18px' }} />
      ) : (
        <>
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New RAG Session
        </>
      )}
    </button>
  )
}
