import Link from 'next/link'
import './runs.css'

interface RunRecord {
  run_id: string
  run_date: string
  status: string
  started_at: string | null
  completed_at: string | null
  total_prompts: number
  total_responses: number
  brand_name: string | null
}

async function fetchRuns(): Promise<RunRecord[]> {
  const pythonApiUrl = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
  const pythonApiSecret = process.env.PYTHON_API_SECRET ?? ''
  try {
    const res = await fetch(`${pythonApiUrl}/runs`, {
      headers: { Authorization: `Bearer ${pythonApiSecret}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

function formatDate(isoString: string | null): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function StatusBadge({ status }: { status: string }) {
  const className = `run-status run-status--${status}`
  return <span className={className}>{status}</span>
}

export default async function RunHistoryPage() {
  const runs = await fetchRuns()

  if (runs.length === 0) {
    return (
      <div className="runs-page">
        <h1 className="runs-title">Run History</h1>
        <p className="runs-empty">No analysis runs yet. Start your first run from the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="runs-page">
      <h1 className="runs-title">Run History</h1>
      <div className="runs-list">
        {runs.map((run) => (
          <div key={run.run_id} className="run-row">
            <div className="run-row-main">
              <div className="run-row-date">{formatDate(run.started_at)}</div>
              <StatusBadge status={run.status} />
              <span className="run-row-prompts">{run.total_prompts} prompts</span>
              <span className="run-row-brand">{run.brand_name ?? 'JG Wentworth'}</span>
            </div>
            <div className="run-row-actions">
              <Link href={`/dashboard/results/${run.run_id}`} className="run-row-link run-row-link--primary">
                View Report
              </Link>
              <Link href="/dashboard" className="run-row-link run-row-link--secondary">
                Run Again
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
