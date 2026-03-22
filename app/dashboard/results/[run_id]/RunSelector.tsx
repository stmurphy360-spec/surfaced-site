'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function parseDateFromRunId(runId: string): Date | null {
  const match = runId.match(/^run_(\d{4})(\d{2})(\d{2})_\d{6}$/)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Date.UTC(+year, +month - 1, +day))
}

function formatRunLabel(runId: string, idx: number, total: number): string {
  const date = parseDateFromRunId(runId)
  if (!date) return runId
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
  return total > 1 ? `${formatted} (#${idx + 1})` : formatted
}

export function RunSelector({ currentRunId }: { currentRunId: string }) {
  const router = useRouter()
  const [runIds, setRunIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/runs/list', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const ids: string[] = data.run_ids ?? []
        setRunIds(ids)
      })
      .catch(() => {})
  }, [])

  if (runIds.length <= 1) {
    return null
  }

  return (
    <select
      className="run-selector"
      value={currentRunId}
      onChange={(e) => router.push(`/dashboard/results/${e.target.value}`)}
    >
      {[...runIds].reverse().map((id, i) => (
        <option key={id} value={id}>
          {formatRunLabel(id, runIds.length - 1 - i, runIds.length)}
        </option>
      ))}
    </select>
  )
}

export function ExportPdfButton({ runId }: { runId: string }) {
  return (
    <a
      href={`/api/runs/${runId}/download?file=print`}
      className="results-csv-link"
      target="_blank"
      rel="noopener"
    >
      Export PDF
    </a>
  )
}
