import type { Metadata } from 'next'
import { RunPanel } from '@/components/RunPanel'
import { ConfigPanel } from '@/components/ConfigPanel'

export const metadata: Metadata = {
  title: 'Dashboard — Surfaced',
  robots: 'noindex',
}

export default function DashboardPage() {
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
