'use client'

import { useState, useEffect } from 'react'

type RunState =
  | { phase: 'idle' }
  | { phase: 'confirming' }
  | { phase: 'running'; jobId: string }
  | { phase: 'done' }
  | { phase: 'error'; message: string }

const POLL_INTERVAL_MS = 3000

export function RunPanel() {
  const [state, setState] = useState<RunState>({ phase: 'idle' })

  // Mount effect: check for active job on load (RUN-04)
  useEffect(() => {
    fetch('/api/runs/active', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.status === 'running' && data?.job_id) {
          setState({ phase: 'running', jobId: data.job_id })
        }
      })
      .catch(() => {}) // silent fail — don't block UI on network error
  }, []) // empty deps — run once on mount

  // Polling effect: poll status while running
  useEffect(() => {
    if (state.phase !== 'running') return
    const jobId = state.jobId
    if (!jobId) return // guard against interim empty jobId (shouldn't occur with pattern below)

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/runs/${jobId}/status`, { cache: 'no-store' })
        if (!res.ok) return // transient — keep polling
        const data = await res.json()
        if (data.status === 'done') {
          clearInterval(intervalId)
          setState({ phase: 'done' })
        } else if (data.status === 'error') {
          clearInterval(intervalId)
          setState({ phase: 'error', message: data.error ?? 'Run failed' })
        }
      } catch {
        // network error — keep polling
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [state])

  // Auto-reset effect: reset to idle after done/error
  useEffect(() => {
    if (state.phase === 'done') {
      const t = setTimeout(() => setState({ phase: 'idle' }), 5000)
      return () => clearTimeout(t)
    }
    if (state.phase === 'error') {
      const t = setTimeout(() => setState({ phase: 'idle' }), 8000)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  async function handleConfirm() {
    try {
      const res = await fetch('/api/runs', { method: 'POST', cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setState({ phase: 'error', message: data.error ?? 'Failed to start run' })
        return
      }
      setState({ phase: 'running', jobId: data.job_id })
    } catch {
      setState({ phase: 'error', message: 'Could not reach server' })
    }
  }

  const isDisabled = state.phase === 'confirming' || state.phase === 'running'

  return (
    <div className="space-y-4">
      <button
        disabled={isDisabled}
        onClick={() => setState({ phase: 'confirming' })}
        className="rounded-md bg-ocean px-4 py-3 font-body font-semibold text-cream hover:bg-ocean-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Run Visibility Check
      </button>

      {state.phase === 'confirming' && (
        <div className="space-y-2">
          <p className="font-body text-ink text-sm">
            This will trigger a full LLM visibility run. Continue?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="rounded-md bg-ocean px-4 py-2 font-body font-semibold text-cream hover:bg-ocean-dark transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setState({ phase: 'idle' })}
              className="rounded-md bg-subtle/20 px-4 py-2 font-body font-semibold text-ink hover:bg-subtle/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.phase === 'running' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 rounded-full border-2 border-ocean border-t-transparent" />
          <p className="font-body text-ink text-sm">Run in progress...</p>
        </div>
      )}

      {state.phase === 'done' && (
        <p className="font-body text-ink text-sm">&#10003; Run complete.</p>
      )}

      {state.phase === 'error' && (
        <p className="font-body text-sm text-red-600">&#10007; Run failed: {state.message}</p>
      )}
    </div>
  )
}
