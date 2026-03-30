import '../results.css'
import { RunSelector, ExportPdfButton, ModelBadgeList } from './RunSelector'

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

async function fetchRunMeta(runId: string): Promise<{ models: Record<string, string>; status?: string }> {
  try {
    const pythonApiUrl = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
    const pythonApiSecret = process.env.PYTHON_API_SECRET ?? ''
    const res = await fetch(`${pythonApiUrl}/runs/${runId}/meta`, {
      headers: { Authorization: `Bearer ${pythonApiSecret}` },
      cache: 'no-store',
    })
    if (!res.ok) return { models: {} }
    const data = await res.json()
    return {
      models: (data.models as Record<string, string>) ?? {},
      status: data.status as string | undefined,
    }
  } catch {
    return { models: {} }
  }
}

async function fetchDaySequenceNumber(runId: string): Promise<number | undefined> {
  try {
    const match = runId.match(/^run_(\d{8})/)
    if (!match) return undefined
    const date = match[1]
    const pythonApiUrl = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
    const pythonApiSecret = process.env.PYTHON_API_SECRET ?? ''
    const res = await fetch(`${pythonApiUrl}/runs`, {
      headers: { Authorization: `Bearer ${pythonApiSecret}` },
      cache: 'no-store',
    })
    if (!res.ok) return undefined
    const data: Array<{ run_id: string }> = await res.json()
    const dayRuns = data
      .map((r) => r.run_id)
      .filter((id) => id.startsWith(`run_${date}`))
      .sort()
    const idx = dayRuns.indexOf(runId)
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
  const [sequenceNumber, runMeta] = await Promise.all([
    fetchDaySequenceNumber(run_id),
    fetchRunMeta(run_id),
  ])
  const { models, status } = runMeta
  const label = formatAnalysisLabel(run_id, sequenceNumber)
  const reportAvailable = status === 'complete'

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
          <ModelBadgeList models={models} />
          {reportAvailable && (
            <>
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
            </>
          )}
        </div>
      </div>
      {reportAvailable ? (
        <iframe
          src={`/api/runs/${run_id}/download?file=report`}
          className="results-iframe"
          title={`Analysis results — ${label}`}
        />
      ) : (
        <div className="results-error">
          <p>Report not available for this run.</p>
          <p className="results-error-detail">
            {status === 'failed' ? 'This analysis run failed.' : status === 'running' ? 'This analysis is still running.' : 'Report data could not be found.'}
          </p>
          <a href="/dashboard" className="results-error-link">Back to Dashboard</a>
        </div>
      )}
    </div>
  )
}
