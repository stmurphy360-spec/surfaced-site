import '../results.css'
import { RunSelector, ExportPdfButton } from './RunSelector'

export const metadata = {
  robots: 'noindex',
}

function parseDateFromRunId(runId: string): Date | null {
  // Format: run_YYYYMMDD_HHMMSS
  const match = runId.match(/^run_(\d{4})(\d{2})(\d{2})_\d{6}$/)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Date.UTC(+year, +month - 1, +day))
}

function formatAnalysisLabel(runId: string, sequenceNumber?: number): string {
  const date = parseDateFromRunId(runId)
  if (!date) return runId // graceful fallback: raw ID if format unrecognized
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
  return sequenceNumber != null
    ? `Analysis — ${formatted} (${sequenceNumber})`
    : `Analysis — ${formatted}`
}

async function fetchDaySequenceNumber(runId: string): Promise<number | undefined> {
  try {
    const match = runId.match(/^run_(\d{8})/)
    if (!match) return undefined
    const date = match[1]
    const pythonApiUrl = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
    const pythonApiSecret = process.env.PYTHON_API_SECRET ?? ''
    const res = await fetch(`${pythonApiUrl}/runs?date=${date}`, {
      headers: { Authorization: `Bearer ${pythonApiSecret}` },
      cache: 'no-store',
    })
    if (!res.ok) return undefined
    const data = await res.json()
    const sorted: string[] = data.run_ids ?? []
    const idx = sorted.indexOf(runId)
    return idx === -1 ? undefined : idx + 1
  } catch {
    return undefined // graceful: show label without count
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ run_id: string }>
}) {
  const { run_id } = await params
  const sequenceNumber = await fetchDaySequenceNumber(run_id)
  const label = formatAnalysisLabel(run_id, sequenceNumber)

  return (
    <div className="results-root">
      <div className="results-topbar">
        <div className="results-topbar-left">
          <a href="/dashboard" className="results-back">
            &larr; Dashboard
          </a>
          <RunSelector currentRunId={run_id} />
          <span className="results-label">{label}</span>
        </div>
        <div className="results-topbar-right">
          <ExportPdfButton runId={run_id} />
          <a
            href={`/api/runs/${run_id}/download?file=full-data-csv`}
            className="results-csv-link"
            download
            target="_blank"
            rel="noopener"
          >
            Download Full Data
          </a>
        </div>
      </div>
      <iframe
        src={`/api/runs/${run_id}/download?file=report`}
        className="results-iframe"
        title={`Analysis results — ${label}`}
      />
    </div>
  )
}
