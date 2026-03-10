'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RunPanel } from '@/components/RunPanel'
import { ConfigPanel } from '@/components/ConfigPanel'

export default function DashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.brand_name) {
          router.replace('/wizard')
        } else {
          setReady(true)
        }
      })
      .catch(() => {
        // Fail open — don't redirect on network error
        setReady(true)
      })
  }, [router])

  if (!ready) return null

  return (
    <main className="min-h-screen bg-cream flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-display text-2xl text-ink">Surfaced</h1>
        <RunPanel />
        <ConfigPanel />
      </div>
    </main>
  )
}
