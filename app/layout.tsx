import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Learn RAG - Interactive RAG Pipeline Simulator',
  description: 'An educational visualizer teaching the mechanics of chunking, embedding, vector databases, and generation.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
