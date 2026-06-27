import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SessionButton from './SessionButton'
import SignOutButton from './SignOutButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userSessions = await prisma.ragSession.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Learn RAG Simulator
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logged in as: {session.user.name}</p>
        </div>
        <SignOutButton />
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <section className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', background: 'rgba(99, 102, 241, 0.02)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Interactive Sandbox</h2>
            <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Upload text or PDF files, visualize how chunk sizes partition text, inspect embeddings, and run query retrieval step-by-step.</p>
          </div>
          <SessionButton />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Sessions</h3>
          {userSessions.length === 0 ? (
            <div className="card text-center text-muted" style={{ padding: '3rem 1rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>No active RAG sessions found.</p>
              <p style={{ fontSize: '0.9rem' }}>Click the "Start New RAG Session" button above to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userSessions.map((s) => (
                <div key={s.id} className="card glow-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{s.documentName || 'Untitled Session'}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Created: {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <Link href={`/learn/${s.id}`} className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                    Open Simulator &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
