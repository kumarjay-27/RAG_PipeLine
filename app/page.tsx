'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const features = [
    {
      title: 'Segmenting & Chunking',
      description: 'See how texts partition into semantic blocks using recursive splitting. Visually inspect overlapping characters in real-time.',
      icon: '✂️',
    },
    {
      title: 'Vector Embeddings',
      description: 'Observe how chunks translate into 768-dimensional space using Gemini. Inspect dimensions and positive/negative values.',
      icon: '📊',
    },
    {
      title: 'Cosine Similarity Search',
      description: 'Run query similarity lookups against the vector DB. Adjust retrieval count (k value) to inspect the retrieved database contexts.',
      icon: '🔍',
    },
    {
      title: 'LLM Generation & Grounding',
      description: 'Watch Gemini synthesize answers strictly using the retrieved text. Inspect prompt templates and prevent hallucinations.',
      icon: '🤖',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #11111f 0%, #050508 100%)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      gap: '4rem',
    }}>
      <header className="text-center" style={{ maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge badge-primary mb-2" style={{ padding: '0.5rem 1rem' }}>Interactive RAG Sandbox</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem', background: 'linear-gradient(to right, #6366f1, #8b5cf6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Learn Retrieval-Augmented Generation
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-secondary"
          style={{ fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: 1.6 }}
        >
          A step-by-step visual sandbox to demystify how RAG works. Upload a document, watch text split, explore vector similarity metrics, and inspect prompt assembly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}
        >
          <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 2rem', fontSize: '1rem', width: 'auto' }}>
            Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '1rem 2rem', fontSize: '1rem', width: 'auto' }}>
            Sign In
          </Link>
        </motion.div>
      </header>

      <main className="grid-2 w-full" style={{ maxWidth: '960px' }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="card glow-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.45 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{f.title}</h3>
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{f.description}</p>
          </motion.div>
        ))}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', width: '100%', maxWidth: '960px', textAlign: 'center', paddingTop: '2.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Built with Next.js, SQLite via Prisma, Pinecone, LangGraph, and Google Gemini-2.5-Flash.
      </footer>
    </div>
  )
}
