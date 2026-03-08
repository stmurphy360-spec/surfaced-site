import type { Metadata } from 'next'
import { RunPanel } from '@/components/RunPanel'

export const metadata: Metadata = {
  title: 'Dashboard — LLM Visibility Tracker',
  robots: 'noindex',
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-cream flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-display text-2xl text-ink">LLM Visibility Tracker</h1>
        <RunPanel />
      </div>
    </main>
  )
}
