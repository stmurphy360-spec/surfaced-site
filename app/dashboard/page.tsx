'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import './dashboard.css'

type RunState =
  | { phase: 'idle' }
  | { phase: 'running'; jobId: string }
  | { phase: 'done'; runId: string }
  | { phase: 'error'; message: string }

const POLL_INTERVAL_MS = 3000
const LS_BRAND_KEY = 'surfaced_brand_name'
const LS_COMPETITORS_KEY = 'surfaced_competitors'

export default function DashboardPage() {
  const router = useRouter()
  const promptRef = useRef<HTMLTextAreaElement>(null)

  const [brandName, setBrandName] = useState('')
  const [prompts, setPrompts] = useState<string[]>([])
  const [promptDraft, setPromptDraft] = useState('')
  const [competitorDraft, setCompetitorDraft] = useState('')
  const [competitors, setCompetitors] = useState<string[]>([])
  const [runState, setRunState] = useState<RunState>({ phase: 'idle' })

  // Restore brand name and competitors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_BRAND_KEY)
    if (saved) setBrandName(saved)
    const savedComp = localStorage.getItem(LS_COMPETITORS_KEY)
    if (savedComp) {
      try { setCompetitors(JSON.parse(savedComp)) } catch { /* ignore */ }
    }
  }, [])

  // Persist brand name to localStorage
  useEffect(() => {
    if (brandName) localStorage.setItem(LS_BRAND_KEY, brandName)
  }, [brandName])

  // Persist competitors to localStorage
  useEffect(() => {
    localStorage.setItem(LS_COMPETITORS_KEY, JSON.stringify(competitors))
  }, [competitors])

  // Check for active run on mount
  useEffect(() => {
    fetch('/api/runs/active', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.status === 'running' && data?.job_id) {
          setRunState({ phase: 'running', jobId: data.job_id })
        }
      })
      .catch(() => {})
  }, [])

  // Poll status while running
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

  // Auto-reset error after 8s
  useEffect(() => {
    if (runState.phase === 'error') {
      const t = setTimeout(() => setRunState({ phase: 'idle' }), 8000)
      return () => clearTimeout(t)
    }
  }, [runState.phase])

  function addPrompt() {
    const text = promptDraft.trim()
    if (!text) return
    setPrompts((prev) => [...prev, text])
    setPromptDraft('')
    promptRef.current?.focus()
  }

  function removePrompt(index: number) {
    setPrompts((prev) => prev.filter((_, i) => i !== index))
  }

  function addCompetitor() {
    const name = competitorDraft.trim()
    if (!name || competitors.includes(name)) return
    setCompetitors((prev) => [...prev, name])
    setCompetitorDraft('')
  }

  function removeCompetitor(index: number) {
    setCompetitors((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleRun() {
    if (!brandName.trim() || prompts.length === 0) return
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName.trim(),
          prompts,
          competitors: competitors.length > 0 ? competitors : null,
        }),
        cache: 'no-store',
      })
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

  const isRunning = runState.phase === 'running'
  const canRun = brandName.trim().length > 0 && prompts.length > 0 && !isRunning && runState.phase !== 'done'

  return (
    <div className="dashboard-root">
      <div className="dash-topbar">
        <span className="dash-topbar-title">New Run</span>
        <button
          className="pe-run-btn"
          disabled={!canRun}
          onClick={handleRun}
        >
          {isRunning && <span className="pe-spinner" />}
          {isRunning ? 'Running...' : `Run Analysis${prompts.length > 0 ? ` (${prompts.length} prompt${prompts.length === 1 ? '' : 's'})` : ''}`}
        </button>
      </div>

      <div className="dash-body">
        <div className="dash-content">

          {/* Running state */}
          {isRunning && (
            <div className="pe-running-banner">
              <span className="pe-spinner" />
              <span>Analysis in progress...</span>
            </div>
          )}

          {/* Error state */}
          {runState.phase === 'error' && (
            <div className="pe-error-banner">
              Analysis failed: {runState.message}
            </div>
          )}

          {/* Brand Name */}
          <section className="pe-section">
            <label className="pe-label" htmlFor="brand-name">Brand Name</label>
            <input
              id="brand-name"
              type="text"
              className="pe-input"
              placeholder="e.g. JG Wentworth"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isRunning}
            />
          </section>

          {/* Prompts */}
          <section className="pe-section">
            <label className="pe-label">Prompts</label>
            <p className="pe-hint">Write questions an LLM user might ask. Each prompt is sent to the model separately.</p>
            <div className="pe-prompt-input-row">
              <textarea
                ref={promptRef}
                className="pe-textarea"
                placeholder="e.g. What are the best options for selling a structured settlement?"
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                disabled={isRunning}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    addPrompt()
                  }
                }}
              />
              <button
                className="pe-add-btn"
                onClick={addPrompt}
                disabled={!promptDraft.trim() || isRunning}
              >
                Add
              </button>
            </div>

            {prompts.length > 0 && (
              <ul className="pe-prompt-list">
                {prompts.map((p, i) => (
                  <li key={i} className="pe-prompt-item">
                    <span className="pe-prompt-num">{i + 1}</span>
                    <span className="pe-prompt-text">{p}</span>
                    {!isRunning && (
                      <button className="pe-remove-btn" onClick={() => removePrompt(i)} aria-label="Remove prompt">
                        &times;
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Competitors */}
          <section className="pe-section">
            <label className="pe-label">Competitors <span className="pe-optional">(optional)</span></label>
            <div className="pe-competitor-input-row">
              <input
                type="text"
                className="pe-input"
                placeholder="e.g. Peachtree Financial"
                value={competitorDraft}
                onChange={(e) => setCompetitorDraft(e.target.value)}
                disabled={isRunning}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCompetitor()
                  }
                }}
              />
              <button
                className="pe-add-btn"
                onClick={addCompetitor}
                disabled={!competitorDraft.trim() || isRunning}
              >
                Add
              </button>
            </div>

            {competitors.length > 0 && (
              <div className="pe-tag-list">
                {competitors.map((c, i) => (
                  <span key={i} className="pe-tag">
                    {c}
                    {!isRunning && (
                      <button className="pe-tag-remove" onClick={() => removeCompetitor(i)} aria-label="Remove competitor">
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
