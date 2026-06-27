import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LearnSandboxClient from './LearnSandboxClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default async function LearnSessionPage({ params }: PageProps) {
  const { sessionId } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const ragSession = await prisma.ragSession.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
  })

  if (!ragSession) {
    redirect('/dashboard')
  }

  return (
    <LearnSandboxClient
      sessionId={sessionId}
      userId={session.user.id}
      initialDocName={ragSession.documentName || 'Untitled Session'}
    />
  )
}
