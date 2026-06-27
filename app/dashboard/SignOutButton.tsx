'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      className="btn-secondary"
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
    >
      Sign Out
    </button>
  )
}
