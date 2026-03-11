'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseDashboardConfig, type ProductLineCard } from '@/lib/dashboard-config'
import './dashboard.css'

type RunState =
  | { phase: 'idle' }
  | { phase: 'running'; jobId: string }
  | { phase: 'done'; runId: string }
  | { phase: 'error'; message: string }

const POLL_INTERVAL_MS = 3000

export default function DashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [cards, setCards] = useState<ProductLineCard[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [runState, setRunState] = useState<RunState>({ phase: 'idle' })

  // Mount: load config, derive cards, initialize selection
  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.brand_name) {
          router.replace('/wizard')
        } else {
          const derived = parseDashboardConfig(data)
          setCards(derived)
          // Initialize selection: all non-skipped product lines
          setSelected(new Set(derived.filter((c) => !c.isSkipped).map((c) => c.name)))
          setReady(true)
        }
      })
      .catch(() => {
        // Fail open — don't redirect on network error
        setReady(true)
      })
  }, [router])

  // Mount: check for active run and resume polling
  useEffect(() => {
    fetch('/api/runs/active', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.status === 'running' && data?.job_id) {
          setRunState({ phase: 'running', jobId: data.job_id })
        }
      })
      .catch(() => {}) // silent fail
  }, [])

  // Polling: poll status while running
  useEffect(() => {
    if (runState.phase !== 'running') return
    const jobId = runState.jobId

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/runs/${jobId}/status`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'done') {
          clearInterval(intervalId)
          setRunState({ phase: 'done', runId: data.run_id })
        } else if (data.status === 'error') {
          clearInterval(intervalId)
          setRunState({ phase: 'error', message: data.error ?? 'Analysis failed' })
        }
      } catch {
        // transient network error — keep polling
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [runState])

  // Auto-redirect when done
  useEffect(() => {
    if (runState.phase === 'done') {
      router.push(`/dashboard/results/${runState.runId}`)
    }
  }, [runState, router])

  // Auto-reset to idle after error (8s)
  useEffect(() => {
    if (runState.phase === 'error') {
      const t = setTimeout(() => setRunState({ phase: 'idle' }), 8000)
      return () => clearTimeout(t)
    }
  }, [runState.phase])

  function toggleCard(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  async function handleRunClick() {
    try {
      const res = await fetch('/api/runs', { method: 'POST', cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setRunState({ phase: 'error', message: data.error ?? 'Failed to start analysis' })
        return
      }
      setRunState({ phase: 'running', jobId: data.job_id })
    } catch {
      setRunState({ phase: 'error', message: 'Could not reach server' })
    }
  }

  if (!ready) return null

  const activeCount = cards.filter((c) => !c.isSkipped).length
  const isRunning = runState.phase === 'running'
  const isRunDisabled = selected.size === 0 || isRunning || runState.phase === 'done'

  const runBtnLabel = isRunning
    ? 'Running...'
    : `Run ${selected.size} of ${activeCount}`

  return (
    <div className="dashboard-root">
      <div className="dash-topbar">
        <span className="dash-topbar-title">Launch Pad</span>
        <button
          className="lp-run-btn"
          disabled={isRunDisabled}
          onClick={handleRunClick}
        >
          {isRunning && <span className="lp-spinner" style={{ marginRight: 8 }} />}
          {runBtnLabel}
        </button>
      </div>

      <div className="dash-body">
        <div className="dash-content">

          {cards.length > 0 && cards.map((card) => (
            <div
              key={card.name}
              className={`lp-card${card.isSkipped ? ' lp-card-skipped' : ''}`}
            >
              {/* Card header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  className="lp-checkbox"
                  checked={selected.has(card.name)}
                  disabled={card.isSkipped || isRunning}
                  onChange={() => toggleCard(card.name)}
                />
                <span className="lp-section-label" style={{ margin: 0 }}>{card.displayName}</span>
                <span className={card.isSkipped ? 'lp-badge-skipped' : 'lp-badge-active'}>
                  {card.isSkipped ? 'Skipped' : 'Active'}
                </span>
                {isRunning && selected.has(card.name) && (
                  <>
                    <span className="lp-spinner" />
                    <span style={{ fontSize: 12, color: '#4b5568' }}>Running</span>
                  </>
                )}
              </div>

              {/* Competitor pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {card.competitors.length > 0
                  ? card.competitors.map((c) => (
                      <span key={c} className="lp-tag">{c}</span>
                    ))
                  : <span style={{ fontSize: 13, color: '#4b5568' }}>No competitors</span>
                }
              </div>

              {/* Claims count */}
              <p style={{ fontSize: 13, color: '#4b5568', margin: 0 }}>
                {card.claimsCount} {card.claimsCount === 1 ? 'claim' : 'claims'}
              </p>
            </div>
          ))}

          {/* Error message */}
          {runState.phase === 'error' && (
            <p style={{ fontSize: 14, color: '#dc2626', marginTop: 12 }}>
              Analysis failed: {runState.message}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
